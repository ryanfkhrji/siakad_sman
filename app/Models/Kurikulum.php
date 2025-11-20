<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kurikulum extends Model
{
    use HasFactory;
    protected $table = 'kurikulum';
    protected $guarded = ['id'];

    public function kompetensiDasars()
    {
        return $this->hasMany(KompetensiDasar::class, 'kurikulum_id');
    }
}
