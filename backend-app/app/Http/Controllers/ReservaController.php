<?php

namespace App\Http\Controllers;

use App\Models\Reserva;
use App\Models\Campo;
use App\Models\Horario;
use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ReservaController extends Controller
{
    /**
     * GET /reservas
     * Suporta filtros:
     *  - ?data=YYYY-MM-DD
     *  - ?status=reservado|cancelado|concluido
     *  - ?cliente_id=ID
     *  - ?campo_id=ID
     *  - ?per_page=10
     *
     * Sempre escopado pelo usuario_id autenticado.
     */
    public function index(Request $request)
    {
        $userId  = $request->user()->id;
        $perPage = (int) $request->query('per_page', 10);

        $query = Reserva::with(['cliente', 'campo', 'horario'])
            ->where('usuario_id', $userId);

        if ($request->filled('data')) {
            $query->whereDate('data', $request->query('data'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('cliente_id')) {
            $query->where('cliente_id', $request->query('cliente_id'));
        }

        if ($request->filled('campo_id')) {
            $query->where('campo_id', $request->query('campo_id'));
        }

        return response()->json(
            $query->orderByDesc('data')->paginate($perPage)
        );
    }

    /**
     * POST /reservas
     * Body:
     *  - campo_id, horario_id, cliente_id, data (YYYY-MM-DD)
     *  - status opcional ['reservado','cancelado','concluido']
     */
    public function store(Request $request)
    {
        $userId = $request->user()->id;

        $data = $request->validate([
            'campo_id'   => ['required', 'integer', 'exists:campos,id'],
            'horario_id' => ['required', 'integer', 'exists:horarios,id'],
            'cliente_id' => ['required', 'integer', 'exists:clientes,id'],
            'data'       => ['required', 'date', 'after_or_equal:today'],
            'status'     => ['nullable', Rule::in(['reservado','cancelado','concluido'])],
        ]);

        // Garante que os objetos relacionados pertencem ao mesmo usuario_id
        if (!Campo::where('id', $data['campo_id'])->where('usuario_id', $userId)->exists()) {
            return response()->json(['message' => 'Campo não encontrado para este usuário.'], 422);
        }

        if (!Horario::where('id', $data['horario_id'])->where('usuario_id', $userId)->exists()) {
            return response()->json(['message' => 'Horário não encontrado para este usuário.'], 422);
        }

        if (!Cliente::where('id', $data['cliente_id'])->where('usuario_id', $userId)->exists()) {
            return response()->json(['message' => 'Cliente não encontrado para este usuário.'], 422);
        }

        // Checagem de disponibilidade (única por campo/horário/data)
        $exists = Reserva::where('usuario_id', $userId)
            ->where('campo_id', $data['campo_id'])
            ->where('horario_id', $data['horario_id'])
            ->whereDate('data', $data['data'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Já existe reserva para este campo/horário nesta data.'], 422);
        }

        $reserva = Reserva::create([
            'usuario_id' => $userId,
            'campo_id'   => $data['campo_id'],
            'horario_id' => $data['horario_id'],
            'cliente_id' => $data['cliente_id'],
            'data'       => $data['data'],
            'status'     => $data['status'] ?? 'reservado',
        ]);

        return response()->json([
            'message' => 'Reserva criada com sucesso.',
            'reserva' => $reserva->load(['cliente','campo','horario']),
        ], 201);
    }

    /**
     * GET /reservas/{id}
     */
    public function show(Request $request, string $id)
    {
        $userId = $request->user()->id;

        $reserva = Reserva::with(['cliente','campo','horario'])
            ->where('usuario_id', $userId)
            ->find($id);

        if (!$reserva) {
            return response()->json(['message' => 'Reserva não encontrada.'], 404);
        }

        return response()->json($reserva);
    }

    /**
     * PUT/PATCH /reservas/{id}
     * Pode atualizar: campo_id, horario_id, cliente_id, data, status
     */
    public function update(Request $request, string $id)
    {
        $userId = $request->user()->id;

        $reserva = Reserva::where('usuario_id', $userId)->find($id);
        if (!$reserva) {
            return response()->json(['message' => 'Reserva não encontrada.'], 404);
        }

        $data = $request->validate([
            'campo_id'   => ['sometimes', 'integer', 'exists:campos,id'],
            'horario_id' => ['sometimes', 'integer', 'exists:horarios,id'],
            'cliente_id' => ['sometimes', 'integer', 'exists:clientes,id'],
            'data'       => ['sometimes', 'date', 'after_or_equal:today'],
            'status'     => ['sometimes', Rule::in(['reservado','cancelado','concluido'])],
        ]);

        // Se mudar qualquer coisa que impacta disponibilidade, valide de novo
        $campoId   = $data['campo_id']   ?? $reserva->campo_id;
        $horarioId = $data['horario_id'] ?? $reserva->horario_id;
        $dataDia   = $data['data']       ?? $reserva->data;

        // Escopo dos relacionados
        if (!Campo::where('id', $campoId)->where('usuario_id', $userId)->exists()) {
            return response()->json(['message' => 'Campo não encontrado para este usuário.'], 422);
        }
        if (!Horario::where('id', $horarioId)->where('usuario_id', $userId)->exists()) {
            return response()->json(['message' => 'Horário não encontrado para este usuário.'], 422);
        }
        if (isset($data['cliente_id']) &&
            !Cliente::where('id', $data['cliente_id'])->where('usuario_id', $userId)->exists()) {
            return response()->json(['message' => 'Cliente não encontrado para este usuário.'], 422);
        }

        // Checagem de disponibilidade ignorando esta própria reserva
        $exists = Reserva::where('usuario_id', $userId)
            ->where('campo_id', $campoId)
            ->where('horario_id', $horarioId)
            ->whereDate('data', $dataDia)
            ->where('id', '<>', $reserva->id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Conflito: já existe reserva para este campo/horário nesta data.'], 422);
        }

        $reserva->update($data);

        return response()->json([
            'message' => 'Reserva atualizada.',
            'reserva' => $reserva->fresh()->load(['cliente','campo','horario']),
        ]);
    }

    /**
     * DELETE /reservas/{id}
     */
    public function destroy(Request $request, string $id)
    {
        $userId = $request->user()->id;

        $reserva = Reserva::where('usuario_id', $userId)->find($id);
        if (!$reserva) {
            return response()->json(['message' => 'Reserva não encontrada.'], 404);
        }

        $reserva->delete();

        return response()->json(['message' => 'Reserva excluída.']);
    }
}
