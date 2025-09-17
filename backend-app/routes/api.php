<?php

use App\Http\Controllers\HorarioController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CampoController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\EmailController;
use App\Http\Controllers\PasswordController;


Route::post('/password/forgot', [PasswordController::class, 'forgot'])
    ->middleware('throttle:6,1'); // evita brute-force
Route::post('/password/reset', [PasswordController::class, 'reset']);
Route::post('/email/send', [EmailController::class, 'send']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/clientes/by-doc', [ClienteController::class, 'findByCpfCnpj']);

    Route::apiResource('campos', CampoController::class);
    Route::apiResource('horarios', HorarioController::class);
    Route::apiResource('reservas', ReservaController::class);
    Route::apiResource('clientes', ClienteController::class)->whereNumber('cliente');
});
