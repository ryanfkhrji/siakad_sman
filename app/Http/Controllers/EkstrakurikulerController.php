<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ekstrakurikuler;
use App\Models\Kepegawaian;
use App\Models\PelatihEkskul;
use App\Models\TahunAkademik;
use App\Helpers\ApiResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class EkstrakurikulerController extends Controller
{
    // ✅ get all ekskul untuk spa
    public function index()
    {
        $ekskul = Ekstrakurikuler::with([
                'siswas.jurusan:id,nama_jurusan',
                'siswas.kelas:id,nama_kelas',
                'pelatihEkskul.pelatih:id,nama',
                'pelatihEkskul.tahunAkademik:id,tahun,status',
                'pembinaEkskul.pembina:id,nama',
                'pembinaEkskul.tahunAkademik:id,tahun,status',
            ])
            ->get();

        $formatted = $ekskul->map(function ($item) {

            return [
                'id_ekskul'     => $item->id,
                'nama_ekskul'   => $item->nama_ekstrakurikuler,
                'anggaran'      => $item->anggaran,
                'status_ekskul' => $item->status,

                'tahun_akademik' => $item->siswas
                    ->groupBy(fn ($siswa) => $siswa->pivot->tahun_akademik_id)
                    ->map(function ($group, $tahunAkademikId) use ($item) {

                        $tahun = $item->pelatihEkskul
                            ->firstWhere('tahun_akademik_id', $tahunAkademikId)
                            ?->tahunAkademik;

                        $pelatih = $item->pelatihEkskul
                            ->firstWhere('tahun_akademik_id', $tahunAkademikId)
                            ?->pelatih;

                        $pembina = $item->pembinaEkskul
                            ->firstWhere('tahun_akademik_id', $tahunAkademikId)
                            ?->pembina;

                        return [
                            'tahun_akademik_id'     => $tahun?->id,
                            'tahun_akademik'        => $tahun?->tahun,
                            'status_tahun_akademik' => $tahun?->status,

                            'id_pembina'   => $pembina?->id,
                            'nama_pembina' => $pembina?->nama,

                            'id_pelatih'   => $pelatih?->id,
                            'nama_pelatih' => $pelatih?->nama,

                            'peserta' => $group->map(function ($siswa) {
                                return [
                                    'pivot_id'        => $siswa->pivot->id,
                                    'siswa_id'        => $siswa->id,
                                    'nama_siswa'      => $siswa->nama,
                                    'kelas_siswa'     => $siswa->kelas?->nama_kelas,
                                    'jurusan'         => $siswa->kelas->jurusan->nama_jurusan ?? null,
                                    'sikap'           => $siswa->pivot->sikap,
                                    'status_aktif'    => $siswa->pivot->status,
                                    'tahun_akademik_id' => $siswa->pivot->tahun_akademik_id,
                                ];
                            })->values(),
                        ];
                    })
                    ->values(),
            ];
        });

        return ApiResponse::success(
            $formatted,
            'Daftar Ekstrakurikuler berhasil diambil'
        );
    }
    // data: [
    //     {
    //         id_ekskul,
    //         nama_ekskul,
    //         anggaran,
    //         status_ekskul,
    //         tahun_akademik: [
    //             {
    //                 tahun_akademik_id,
    //                 tahun_akademik,
    //                 status_tahun_akademik,
    //                 id_pembina,
    //                 nama_pembina,
    //                 id_pelatih,
    //                 nama_pelatih,
    //                 peserta: [
    //                     {
    //                         pivot_id,
    //                         siswa_id,
    //                         nama_siswa,
    //                         jurusan_siswa,
    //                         kelas_siswa,
    //                         sikap
    //                     },
    //                     {...}
    //                 ]
    //             },
    //             {...}
    //         ]
    //     },
    //     {...}
    // ]


    // ✅ show semua ekskul milik pegawai
    public function showEkskulSendiri()
    {
        $pegawai = Auth::guard('kepegawaian')->user();

        $pelatihEkskul = PelatihEkskul::with([
                'pelatih:id,nama',
                'ekstrakurikuler:id,nama_ekstrakurikuler,anggaran,status',
                'ekstrakurikuler.siswas:id,nama',
                'tahunAkademik:id,tahun,status'
            ])
            ->where('pelatih_id', $pegawai->id)
            ->get();

        if ($pelatihEkskul->isEmpty()) {
            return ApiResponse::error(
                'Not found',
                ['id' => ['Data tidak ditemukan']],
                404
            );
        }

        $formatted = $pelatihEkskul
            ->groupBy('pelatih_id')
            ->map(function ($items) {

                $pelatih = $items->first()->pelatih;

                return [
                    'pelatih_id'   => $pelatih->id,
                    'guru_id'      => $pelatih->id,
                    'nama_pelatih' => $pelatih->nama,

                    'tahun_akademik' => $items
                        ->groupBy('tahun_akademik_id')
                        ->map(function ($perTahun) {

                            $row   = $perTahun->first();
                            $ekskul = $row->ekstrakurikuler;

                            return [
                                'tahun_akademik_id'     => $row->tahunAkademik->id,
                                'tahun_akademik'        => $row->tahunAkademik->tahun,
                                'status_tahun_akademik' => $row->tahunAkademik->status,

                                'nama_ekskul'  => $ekskul->nama_ekstrakurikuler,
                                'anggaran'     => $ekskul->anggaran,
                                'status_ekskul'=> $ekskul->status,

                                'anggota' => $ekskul->siswas
                                    ->where(
                                        'pivot.tahun_akademik_id',
                                        $row->tahun_akademik_id
                                    )
                                    ->map(function ($siswa) {
                                        return [
                                            'pivot_id'   => $siswa->pivot->id ?? null,
                                            'siswa_id'   => $siswa->id,
                                            'nama_siswa' => $siswa->nama,                                            
                                            'status_aktif' => $siswa->pivot->status,
                                            'sikap'      => $siswa->pivot->sikap,
                                            'tahun_akademik_id' => $siswa->pivot->tahun_akademik_id
                                        ];
                                    })
                                    ->values()
                            ];
                        })
                        ->values()
                ];
            })
            ->values();

        return ApiResponse::success(
            $formatted,
            'Detail ekstrakurikuler berhasil diambil'
        );
    }
    /**
     * 
     * data: [
     * {
     *      pelatih,
     *      tahun_akademik: [
     *          {
     *              tahun_akademik_id,
     *              nama_ekskul,
     *              anggota: []       
     *          },
     *          {...}
     *      ]
     * }
     * ]
     * 
     * */


    // ✅ show detail ekskul untuk SPA (pegawai tidak)
    public function show($id)
    {
        $ekskul = Ekstrakurikuler::with([
                'siswas.kelas.jurusan:id,nama_jurusan',
                'siswas.kelas:id,nama_kelas',
                'pelatihEkskul.pelatih:id,nama',
                'pelatihEkskul.tahunAkademik:id,tahun,status',
                'pembinaEkskul.pembina:id,nama',
                'pembinaEkskul.tahunAkademik:id,tahun,status',
            ])
            ->find($id);

        if (!$ekskul) {
            return ApiResponse::error(
                'Ekstrakurikuler tidak ditemukan',
                ['id' => ['Data tidak ditemukan']],
                404
            );
        }

        // 🔐 Ambil tahun akademik AKTIF saja
        $tahunAktif = $ekskul->pelatihEkskul
            ->first(fn ($row) => $row->tahunAkademik->status === 'aktif')
            ?->tahunAkademik;

        if (!$tahunAktif) {
            return ApiResponse::error(
                'Tahun akademik aktif tidak ditemukan',
                [],
                404
            );
        }

        $pelatih = $ekskul->pelatihEkskul
            ->firstWhere('tahun_akademik_id', $tahunAktif->id);

        $pembina = $ekskul->pembinaEkskul
            ->firstWhere('tahun_akademik_id', $tahunAktif->id);

        $peserta = $ekskul->siswas
            ->where('pivot.tahun_akademik_id', $tahunAktif->id)
            ->map(function ($siswa) use ($tahunAktif) {
                return [
                    'pivot_id'          => $siswa->pivot->id,
                    'siswa_id'          => $siswa->id,
                    'nama_siswa'        => $siswa->nama,
                    'jurusan'           => $siswa->kelas->jurusan->nama_jurusan ?? null,
                    'kelas'             => $siswa->kelas?->nama_kelas,
                    'sikap'             => $siswa->pivot->sikap,
                    'status_aktif'      => $siswa->pivot->status_aktif,
                    'tahun_akademik_id' => $tahunAktif->id,
                ];
            })
            ->values();

        $formatted = [
            'id_ekskul'   => $ekskul->id,
            'nama_ekskul' => $ekskul->nama_ekstrakurikuler,
            'anggaran'    => $ekskul->anggaran,
            'status'      => $ekskul->status,

            'tahun_akademik_aktif' => [
                'tahun_akademik_id'     => $tahunAktif->id,
                'tahun_akademik'        => $tahunAktif->tahun,
                'status_tahun_akademik' => $tahunAktif->status,

                'pembina' => [
                    'pembina_id'        => $pembina?->pembina->id,
                    'nama_pembina'      => $pembina?->pembina->nama,
                    'tahun_akademik_id' => $tahunAktif->id,
                ],

                'pelatih' => [
                    'pelatih_id'        => $pelatih?->pelatih->id,
                    'nama_pelatih'      => $pelatih?->pelatih->nama,
                    'tahun_akademik_id' => $tahunAktif->id,
                ],

                'peserta' => $peserta,
            ],
        ];

        return ApiResponse::success(
            $formatted,
            'Detail ekstrakurikuler berhasil diambil'
        );
    }
    // data: {
    //         id_ekskul: 1,
    //         nama_ekskul: "Pramuka",
    //         anggaran: '5000000',
    //         status: 'pilihan',
    //         tahun_akademik_aktif: {
    //             tahun_akademik_id: 2,
    //             tahun_akademik: '2026/2027',
    //             status_tahun_akademik: 'aktif', // harus aktif (hanya aktif yang di get)
    //             pembina: {
    //                 pembina_id: 5,
    //                 nama_pembina: 'Sekar',
    //                 tahun_akademik_id: 2, // untuk memastikan sama dengan yang di atas
    //             },
    //             pelatih: {
    //                 pelatih_id: 1,
    //                 nama_pelatih: 'Winton',
    //                 tahun_akademik_id: 2, // untuk memastikan sama dengan yang di atas
    //             },
    //             peserta: [
    //                 {
    //                     pivot_id: 1,
    //                     siswa_id: 5,
    //                     nama_siswa: 'Danu',
    //                     jurusan: 'IPA',
    //                     kelas: 'XA',
    //                     sikap: 'Baik',
    //                     status_aktif: 'aktif',
    //                     tahun_akademik_id: 2, // untuk memastikan sama dengan yang di atas
    //                 },
    //                 {...}
    //             ]
    //         }    
    // }



    // ✅ store ekskul untuk spa (pegawai tidak karena tidak terkait anggota)
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nama_ekstrakurikuler' => 'required|unique:ekstrakurikulers,nama_ekstrakurikuler',                
                'anggaran' => 'required|numeric',
                'status' => 'required|in:wajib,pilihan,jurusan,aktif,tidak aktif',
            ], [
                'nama_ekstrakurikuler.required' => 'Nama ekskul wajib diisi',
                'nama_ekstrakurikuler.unique' => 'Nama ekskul sudah ada',                                                
                'anggaran.required' => 'Anggaran wajib diisi',
                'status.required' => 'Status wajib diisi',
                'status.in' => 'Pilihan hanya wajib, pilihan, jurusan, aktif dan tidak aktif'
            ]);           

            $ekstrakurikuler = Ekstrakurikuler::create($validated);            

            return ApiResponse::success([
                'id' => $ekstrakurikuler->id,
                'nama_ekstrakurikuler' => $ekstrakurikuler->nama_ekstrakurikuler,                
                'anggaran' => $ekstrakurikuler->anggaran,
                'status' => $ekstrakurikuler->status,
            ], 'Ekstrakurikuler berhasil dibuat');
        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }
    
    // ✅ update ekskul untuk spa (pegawai tidak karna tidak terkait anggota)
    public function update(Request $request, $id)
    {
        $ekskul = Ekstrakurikuler::find($id);
        if (!$ekskul) {
            return ApiResponse::error('Ekstrakurikuler tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $validated = $request->validate([
            'nama_ekstrakurikuler' => [
                'sometimes',
                'required',
                Rule::unique('ekstrakurikulers')->ignore($id) // Periksa semua unik kecuali yang sedang diedit
            ],            
            'anggaran' => 'sometimes|required|numeric',
            'status' => 'sometimes|required|in:wajib,pilihan,jurusan,aktif,tidak aktif'
        ], [
            'nama_ekstrakurikuler.required' => 'Nama ekskul wajib diisi',
            'nama_ekstrakurikuler.unique' => 'Nama ekskul sudah ada',            
            'anggaran.required' => 'Anggaran wajib diisi',
            'status.required' => 'Status wajib diisi',
            'status.in' => 'Pilihan hanya wajib, pilihan, jurusan, aktif dan tidak aktif'
        ]);

        // if (isset($validated['pengajar_id'])) {
        //     $wali = Kepegawaian::find($validated['pengajar_id']);
        //     if (!$wali || $wali->role !== 'guru' && $wali->role !== 'staff') {
        //         return ApiResponse::error('Pengajar bukan guru atau staff', [
        //             'pengajar_id' => ['Pengajar tidak ditemukan']
        //         ], 422);
        //     }
        // }

        $ekskul->update($validated);        

        return ApiResponse::success(
            [
                'id' => $ekskul->id,
                'nama_ekstrakurikuler' => $ekskul->nama_ekstrakurikuler,                
                'anggaran' => $ekskul->anggaran,
                'status' => $ekskul->status,
            ],
            'Ekstrakurikuler berhasil diperbarui'
        );
    }

    // ! tidak ada hapus, pakai status = tidak aktif aja

}