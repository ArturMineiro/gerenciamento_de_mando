<?php

namespace App\Http\Controllers;

use App\Models\Horario;
use Illuminate\Http\Request;

class HorarioController extends Controller
{
    /**
     * GET /horarios
     * Suporta ?q=HH:MM e ?per_page=10
     */
    public function index(Request $request)
    {
        $userId  = $request->user()->id;
        $q       = $request->query('q');
        $perPage = (int) $request->query('per_page', 10);

        $query = Horario::where('usuario_id', $userId);

        if ($q) {
            $query->where(function ($w) use ($q) {
                $w->where('hora_inicio', 'like', "%{$q}%")
                  ->orWhere('hora_fim', 'like', "%{$q}%");
            });
        }

        return response()->json(
            $query->orderBy('hora_inicio')->paginate($perPage)
        );
    }

    /**
     * POST /horarios
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'hora_inicio' => ['required', 'date_format:H:i'],
            'hora_fim'    => ['required', 'date_format:H:i', 'after:hora_inicio'],
        ]);

        $user = $request->user();

        // Já existe o mesmo intervalo?
        $duplicado = Horario::where('usuario_id', $user->id)
            ->where('hora_inicio', $data['hora_inicio'])
            ->where('hora_fim', $data['hora_fim'])
            ->exists();

        if ($duplicado) {
            return response()->json([
                'message' => 'Você já tem um horário com exatamente este intervalo.'
            ], 422);
        }

        // Conflito de intervalo?
        if ($this->temConflito($user->id, $data['hora_inicio'], $data['hora_fim'])) {
            return response()->json([
                'message' => 'Este intervalo conflita com outro horário seu.'
            ], 422);
        }

        // Cria pelo relacionamento do usuário (seta usuario_id automaticamente)
        // OBS: precisa do método horarios() no Model do usuário:
        // public function horarios() { return $this->hasMany(Horario::class, 'usuario_id'); }
        $horario = $user->horarios()->create([
            'hora_inicio' => $data['hora_inicio'],
            'hora_fim'    => $data['hora_fim'],
        ]);

        return response()->json([
            'message' => 'Criado com sucesso.',
            'horario' => $horario
        ], 201);
    }

    /**
     * GET /horarios/{id}
     */
    public function show(Request $request, $id)
    {
        $horario = Horario::where('usuario_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json($horario);
    }

    /**
     * PUT/PATCH /horarios/{id}
     */
    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'hora_inicio' => ['required', 'date_format:H:i'],
            'hora_fim'    => ['required', 'date_format:H:i', 'after:hora_inicio'],
        ]);

        $userId  = $request->user()->id;
        $horario = Horario::where('usuario_id', $userId)->findOrFail($id);

        // Mesmo intervalo já existente (excluindo o próprio)
        $duplicado = Horario::where('usuario_id', $userId)
            ->where('hora_inicio', $data['hora_inicio'])
            ->where('hora_fim', $data['hora_fim'])
            ->where('id', '!=', $horario->id)
            ->exists();

        if ($duplicado) {
            return response()->json([
                'message' => 'Você já tem um horário com exatamente este intervalo.'
            ], 422);
        }

        // Conflito de intervalo com outro horário do mesmo usuário (exclui o próprio)
        if ($this->temConflito($userId, $data['hora_inicio'], $data['hora_fim'], $horario->id)) {
            return response()->json([
                'message' => 'Este intervalo conflita com outro horário seu.'
            ], 422);
        }

        $horario->update([
            'hora_inicio' => $data['hora_inicio'],
            'hora_fim'    => $data['hora_fim'],
        ]);

        return response()->json([
            'message' => 'Atualizado com sucesso.',
            'horario' => $horario
        ]);
    }

    /**
     * DELETE /horarios/{id}
     */
    public function destroy(Request $request, $id)
    {
        $horario = Horario::where('usuario_id', $request->user()->id)->findOrFail($id);
        $horario->delete();

        return response()->noContent();
    }

    /**
     * Regra de sobreposição de intervalos para o mesmo usuário:
     * existe conflito quando (inicio_novo < fim_existente) && (fim_novo > inicio_existente)
     */
    private function temConflito(int $usuarioId, string $inicio, string $fim, ?int $ignorarId = null): bool
    {
        $q = Horario::where('usuario_id', $usuarioId)
            ->where('hora_inicio', '<', $fim)
            ->where('hora_fim', '>', $inicio);

        if (!is_null($ignorarId)) {
            $q->where('id', '!=', $ignorarId);
        }

        return $q->exists();
    }
}
