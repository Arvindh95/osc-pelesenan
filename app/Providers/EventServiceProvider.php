<?php

namespace App\Providers;

use App\Events\M02\DokumenDimuatNaik;
use App\Events\M02\PermohonanDiserahkan;
use App\Listeners\M02\ForwardToModule5Listener;
use App\Listeners\M02\QueueAntivirusScanListener;
use App\Listeners\M02\SendSubmissionNotificationListener;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        PermohonanDiserahkan::class => [
            ForwardToModule5Listener::class,
            SendSubmissionNotificationListener::class,
        ],
        DokumenDimuatNaik::class => [
            QueueAntivirusScanListener::class,
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        //
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
