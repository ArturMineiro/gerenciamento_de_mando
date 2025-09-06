<?php

use App\Http\Controllers\HorarioController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CampoController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\ReservaController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::apiResource('campos', CampoController::class);
    Route::apiResource('horarios', HorarioController::class);
    Route::apiResource('reservas', ReservaController::class);
    Route::apiResource('clientes', ClienteController::class);
});
