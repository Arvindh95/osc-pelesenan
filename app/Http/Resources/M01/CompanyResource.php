<?php

namespace App\Http\Resources\M01;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompanyResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ssm_no' => $this->ssm_no,
            'name' => $this->name,
            'status' => $this->status,
            'owner_user_id' => $this->owner_user_id,
            'owner' => new UserResource($this->whenLoaded('owner')),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}