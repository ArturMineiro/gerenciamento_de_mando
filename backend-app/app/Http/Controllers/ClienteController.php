<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ClienteController extends Controller
{
    /**
     * GET /clientes
     * Suporta ?q= e ?per_page=10
     */
    public function index(Request $request)
    {
        $userId  = $request->user()->id;
        $q       = trim((string) $request->query('q', ''));
        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 100));

        $query = Cliente::where('usuario_id', $userId);

        if ($q !== '') {
            $query->where(function ($w) use ($q) {
                $w->where('nome', 'like', "%{$q}%")
                  ->orWhere('cpf_cnpj', 'like', "%{$q}%")
                  ->orWhere('email', 'like', "%{$q}%")
                  ->orWhere('telefone', 'like', "%{$q}%");
            });
        }

        return response()->json(
            $query->orderBy('nome')->paginate($perPage)
        );
    }

    /**
     * POST /clientes
     */
    public function store(Request $request)
    {
        $userId = $request->user()->id;

        $data = $request->validate([
            'cpf_cnpj' => ['required', 'string', 'max:32', 'unique:clientes,cpf_cnpj'],
            'nome'     => ['required', 'string', 'max:255'],
            'telefone' => ['nullable', 'string', 'max:40'],
            'email'    => ['nullable', 'email', 'max:255'],
        ]);

        $data['usuario_id'] = $userId;

        $cliente = Cliente::create($data);

        return response()->json([
            'message' => 'Cliente criado com sucesso.',
            'cliente' => $cliente,
        ], 201);
    }

    /**
     * GET /clientes/{id}
     */
    public function show(Request $request, int $id)
    {
        $userId = $request->user()->id;

        $cliente = Cliente::where('usuario_id', $userId)->findOrFail($id);

        return response()->json($cliente);
    }

    /**
     * PUT/PATCH /clientes/{id}
     */
    public function update(Request $request, int $id)
    {
        $userId  = $request->user()->id;
        $cliente = Cliente::where('usuario_id', $userId)->findOrFail($id);

        $data = $request->validate([
            // se mandar cpf_cnpj no update, mantém unicidade ignorando o próprio ID
            'cpf_cnpj' => ['sometimes', 'required', 'string', 'max:32', Rule::unique('clientes', 'cpf_cnpj')->ignore($cliente->id)],
            'nome'     => ['sometimes', 'required', 'string', 'max:255'],
            'telefone' => ['nullable', 'string', 'max:40'],
            'email'    => ['nullable', 'email', 'max:255'],
        ]);

        $cliente->update($data);

        return response()->json([
            'message' => 'Cliente atualizado com sucesso.',
            'cliente' => $cliente,
        ]);
    }

    /**
     * DELETE /clientes/{id}
     */
    public function destroy(Request $request, int $id)
    {
        $userId  = $request->user()->id;
        $cliente = Cliente::where('usuario_id', $userId)->findOrFail($id);

        $cliente->delete();

        return response()->json(['message' => 'Cliente excluído com sucesso.']);
    }
}
