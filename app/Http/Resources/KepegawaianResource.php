<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KepegawaianResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'   => $this->id,
            'nama' => $this->nama,
            'status' => $this->status,
            'nip'  => $this->nip,
            'keterangan'  => $this->keterangan,
            'role' => $this->role,
        ];
    }
}
