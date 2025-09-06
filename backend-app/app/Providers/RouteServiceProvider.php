<?php

namespace App\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;

class RouteServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->routes(function () {
            // Rotas de API
            Route::prefix('api')          // ⬅️ prefixo obrigatório
                ->middleware('api')      // grupo API
                ->group(base_path('routes/api.php')); // arquivo API

            // Rotas web
            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        });
    }
}
