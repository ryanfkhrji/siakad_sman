<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KelasResource extends JsonResource
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
            'nama_kelas' => $this->nama_kelas,
            'jam_masuk' => $this->jam_masuk,
            'wali_kelas'  => $this->wali_kelas,
        ];
    }
}
