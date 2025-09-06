<?php





use App\Http\Controllers\HorarioController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CampoController;
use App\Http\Controllers\ClienteController;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::apiResource('campos', CampoController::class);
    Route::apiResource('horarios', HorarioController::class);
// 👉 Clientes
    Route::apiResource('clientes', ClienteController::class);
});
