<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AtlasHookController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('welcome', [
            'template' => $request->get('template'),
            'save_as' => $request->get('save_as'),
            'description' => $request->get('description'),
            'edit_saved_id' => $request->get('edit_saved_id'),
            'quick_send' => $request->get('quick_send'),
        ]);
    }
}
