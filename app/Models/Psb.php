<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Psb extends Model
{
    use HasFactory;
    protected $table = 'penerimaan_siswa_baru';
    protected $guarded = ['id'];
}
