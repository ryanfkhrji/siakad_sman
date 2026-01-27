<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class WaliRombelController extends Controller
{
    /**
     * spa/tu (SAMPE SINI)
     * get guru dan histori menjadi wali
     */
    public function show(string $id)
    {
        //
    }

    /**
     * spa/tu
     */
    public function store(Request $request)
    {
        // gaboleh 2 wali pada tahun yang sama
    }    

    // guru
    public function getAllRombelSendiri(string $id)
    {
        //
    }

    /**
     * spa/tu
     */
    public function update(Request $request, string $id)
    {
        // kalo tahun udah arsip maka tidak boleh
    }

    /**
     * spa/tu
     */
    public function destroy(string $id)
    {
        // jika tahun_akademik sudah arsip maka tidak boleh        
    }

    // spa/tu
    public function dataSelect(string $id)
    {
        // role guru saja

        // semua rombel

        // tahun yang aktif saja
    }
}
