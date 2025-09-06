<?php

namespace App\Http\Controllers;

use App\Models\Campo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class CampoController extends Controller
{
    /**
     * Lista os campos (admin vê todos, gerenciador vê só os dele).
     * Suporta paginação e filtro por nome (q).
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $query = Campo::query();

        // Filtro por nome (opcional): ?q=texto
        if ($request->filled('q')) {
            $q = $request->query('q');
            $query->where('nome', 'like', "%{$q}%");
        }

        // Regra de visibilidade
        if ($user->role !== 'admin') {
            $query->where('usuario_id', $user->id);
        }

        // Paginação (?per_page=15)
        $perPage = (int) ($request->query('per_page', 15));
        $campos = $query->orderByDesc('id')->paginate($perPage);

        return response()->json($campos);
    }

    /**
     * Cria um novo campo para o usuário autenticado.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $data = $request->validate([
            'nome'        => ['required', 'string', 'max:255'],
            'localizacao' => ['nullable', 'string', 'max:255'],
            // 'usuario_id' não vem do request; é o usuário autenticado
        ]);

        $campo = Campo::create([
            'nome'        => $data['nome'],
            'localizacao' => $data['localizacao'] ?? null,
            'usuario_id'  => $user->id,
        ]);

        return response()->json([
            'message' => 'Campo criado com sucesso',
            'campo'   => $campo,
        ], 201);
    }

    /**
     * Mostra um campo específico.
     */
    public function show(Campo $campo)
    {
        $this->authorizeOwnership($campo);
        return response()->json($campo);
    }

    /**
     * Atualiza um campo específico.
     */
    public function update(Request $request, Campo $campo)
    {
        $this->authorizeOwnership($campo);

        $data = $request->validate([
            'nome'        => ['sometimes', 'required', 'string', 'max:255'],
            'localizacao' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        $campo->update($data);

        return response()->json([
            'message' => 'Campo atualizado com sucesso',
            'campo'   => $campo,
        ]);
    }

    /**
     * Exclui um campo específico.
     */
    public function destroy(Campo $campo)
    {
        $this->authorizeOwnership($campo);

        $campo->delete();

        return response()->json([
            'message' => 'Campo removido com sucesso',
        ]);
    }

    /**
     * Regras de propriedade: admin pode tudo; gerenciador só no que é dele.
     */
    private function authorizeOwnership(Campo $campo): void
    {
        $user = Auth::user();

        if ($user->role === 'admin') {
            return; // admin tem acesso total
        }

        if ($campo->usuario_id !== $user->id) {
            abort(response()->json([
                'message' => 'Você não tem permissão para acessar este recurso.',
            ], 403));
        }
    }
}
