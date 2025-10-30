<?php

namespace App\Events\M02;

use App\Models\Permohonan;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PermohonanDiserahkan
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Permohonan $permohonan
    ) {}
}
