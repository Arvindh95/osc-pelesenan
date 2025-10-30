<?php

namespace App\Events\M02;

use App\Models\PermohonanDokumen;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DokumenDimuatNaik
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public PermohonanDokumen $permohonanDokumen
    ) {}
}
