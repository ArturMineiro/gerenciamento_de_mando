<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EmailController extends Controller
{
    public function send(Request $request)
    {
        $data = $request->validate([
            'email'   => 'required|email',
            'name'    => 'nullable|string|max:100',
            'subject' => 'nullable|string|max:120',
            'message' => 'nullable|string|max:2000',
        ]);

        $payload = [
            'service_id'      => config('services.emailjs.service_id'),
            'template_id'     => config('services.emailjs.template_id'),
            'user_id'         => config('services.emailjs.public_key'),   // Public Key
            'accessToken'     => config('services.emailjs.private_key'),  // Private Key (se ativada)
            'template_params' => [
                // Vars devem existir no Template do EmailJS:
                'to_email'  => $data['email'],
                'to_name'   => $data['name'] ?? 'usuário',
                'subject'   => $data['subject'] ?? 'Recebemos seu contato',
                'message'   => $data['message'] ?? 'Obrigado! Já recebemos seus dados.',
                'reply_to'  => $data['email'], // se quiser que o "Responder" vá pro usuário
            ],
        ];

        $res = Http::asJson()
            ->post('https://api.emailjs.com/api/v1.0/email/send', $payload);

        if ($res->successful()) {
            return response()->json(['ok' => true], 200);
        }

        Log::error('EmailJS error', ['status' => $res->status(), 'body' => $res->body()]);
        return response()->json([
            'ok' => false,
            'error' => $res->json() ?? $res->body(),
        ], 422);
    }
}
