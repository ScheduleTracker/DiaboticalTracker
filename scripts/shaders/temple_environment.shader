temple_floor_test
{
 {
  map textures/temp_textures/inc_floor_d.png
  map textures/temp_textures/inc_floor_n.png
  map textures/temp_textures/inc_floor_s.png
  map textures/temp_textures/temple/sandwaveless_d.png
  map textures/temp_textures/temple/sandwaveless_n.png
  map textures/temp_textures/dirt_s.png
  map textures/temp_textures/temple/blend_mask2.png
  material_id 40
  vertex_shader tile.vs.cso 111 NGT
  pixel_shader tileblend2dc.ps.cso
  pixel_shader_param float_params 0.5 0.5
        uv_scale 0.25
  vertex_shader_param inverse
  vertex_shader_param camera
 }
}

temple_floor
{
 {
  map textures/temp_textures/inc_floor_d.png
  map textures/temp_textures/inc_floor_n.png
  map textures/temp_textures/inc_floor_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.0625
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}

// omar textures
temple_stone_plain01
{
	{
		// map textures/temp_textures/temple/stone_plain01/stone_plain_d.png
		map textures/colors/temple_04.png
		map textures/temp_textures/temple/stone_plain_n.png
		map textures/temp_textures/temple/stone_plain_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.25
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}

temple_plaster
{
	{
		// map textures/temp_textures/temple/plaster/temple_plaster_d.png
		map textures/colors/temple_04.png
		map textures/temp_textures/temple/temple_plaster_n.png
		map textures/temp_textures/temple/temple_plaster_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.25
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}
temple_roof_plain
{
	{
		map textures/temp_textures/temple/temple_roof_plain_d.png
		// map textures/colors/temple_02.png
		map textures/temp_textures/temple/temple_roof_plain_n.png
		// map textures/temp_textures/temple/temple_roof_plain_s.png
		map textures/black.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.25
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}

temple_stone_border
{
	{
		// map textures/temp_textures/temple/stone_border/stone_border_d.png
		map textures/colors/temple_04.png
		map textures/temp_textures/temple/stone_border_n.png
		map textures/temp_textures/temple/stone_border_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.25
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}

temple_blend_plaster
{
 {

  map textures/temp_textures/temple/base_d.png
  map textures/temp_textures/temple/base_n.png
  map textures/temp_textures/temple/base_s.png
  map textures/temp_textures/temple/blend_d.png
  map textures/temp_textures/temple/blend_n.png
  map textures/temp_textures/temple/blend_s.png
  map textures/temp_textures/temple/blend_mask.png
  material_id 40
  vertex_shader tile.vs.cso 111 NGT
  pixel_shader tileblend2db.ps.cso
  pixel_shader_param float_params 0.6
        uv_scale 0.25
  vertex_shader_param inverse
  vertex_shader_param camera
 }
}

temple_stone_plain02
{
	{
		map textures/temp_textures/temple/stone_plain02_d.png
		// map textures/colors/temple_01.png
		map textures/temp_textures/temple/stone_plain02_n.png
		map textures/black.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.125
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}

temple_stone_plain02_2
{
	{
		map textures/temp_textures/temple/stone_plain02_d.png
		// map textures/colors/temple_01.png
		map textures/temp_textures/temple/stone_plain02_n.png
		map textures/temp_textures/temple/stone_plain02_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.25
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}

temple_sand
{
	{
		map textures/temp_textures/temple/sandwaveless_d.png
		map textures/temp_textures/temple/sandwaveless_n.png
	map textures/black.png
		map textures/black.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.125
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}

temple_sand_stone
{
 {
		map textures/temp_textures/temple/sand_stone_d.png
	map textures/flat_normal.png
	map textures/black.png
	
		map textures/temp_textures/temple/sandwaveless_d.png
		map textures/temp_textures/temple/sandwaveless_n.png
		map textures/temp_textures/temple/sandwaveless_s.png
	

	
		map textures/temp_textures/temple/sand_m.png
	material_id 40
	vertex_shader tile.vs.cso 111 NGT
	pixel_shader tileblend2db.ps.cso
	pixel_shader_param float_params 0.5
		uv_scale 0.125
	vertex_shader_param inverse
	vertex_shader_param camera
 }
}



temple_panel_01
{
	{
		map textures/temp_textures/temple/temple_panel_d.png
		// map textures/colors/temple_01.png
		map textures/temp_textures/temple/temple_panel_n.png
		map textures/temp_textures/temple/temple_panel_s.png
		map textures/temp_textures/temple/temple_panel_i.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.5
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}

temple_color
{
	{
		map textures/temp_textures/temple/stone_color_d.png
		// map textures/colors/temple_01.png
		map textures/temp_textures/temple/stone_plain02_n.png
		map textures/black.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.125
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}

temple_roof
{
	{
		map textures/temp_textures/temple/roof_pattern.png
		map textures/flat_normal.png
		map textures/black.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.125
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}

temple_wall1
{
 {

	map textures/temple/textures/wall_clean01.png
	map textures/temple/textures/stone01_n.png
	map textures/black.png
	map textures/temp_textures/temple/stone_plain02_d.png
	map textures/temp_textures/temple/stone_plain02_n.png
	map textures/black.png
	map textures/temple/masks/blend_mask05.png
	material_id 40
	vertex_shader tile.vs.cso 111 NGT
  pixel_shader tileblend2dc.ps.cso
	pixel_shader_param float_params 0.2 0.8
    uv_scale 0.125
	vertex_shader_param inverse
	vertex_shader_param camera
 }
}

temple_wall2
{
 {

	map textures/temple/textures/wall_clean02.png
	map textures/temple/textures/stone01_n.png
	map textures/black.png
	map textures/temp_textures/temple/new_temple_wall_d.png
	map textures/temp_textures/temple/new_temple_wall_n.png
	map textures/black.png
	map textures/temple/masks/blend_mask03.png
	material_id 40
	vertex_shader tile.vs.cso 111 NGT
	pixel_shader tileblend2db.ps.cso
	pixel_shader_param float_params 0.2
    uv_scale 0.125
	vertex_shader_param inverse
	vertex_shader_param camera
 }
}

temple_wall3
{
 {

	map textures/temple/textures/wall_clean03.png
	map textures/temple/textures/stone01_n.png
	map textures/black.png
	map textures/temple/textures/wall_clean01.png
	map textures/temp_textures/temple/stone_plain02_n.png
	map textures/black.png
	map textures/temple/masks/blend_mask03.png
	material_id 40
	vertex_shader tile.vs.cso 111 NGT
	pixel_shader tileblend2db.ps.cso
	pixel_shader_param float_params 0.6
    uv_scale 0.125
	vertex_shader_param inverse
	vertex_shader_param camera
 }
}

temple_wall4
{
 {

	map textures/temple/textures/wall_clean07.png
	map textures/temple/textures/stone01_n.png
	map textures/black.png
	map textures/temple/textures/wall_clean05.png
	map textures/temp_textures/temple/stone_plain02_n.png
	map textures/black.png
	map textures/temple/masks/blend_mask03.png
	material_id 40
	vertex_shader tile.vs.cso 111 NGT
	pixel_shader tileblend2db.ps.cso
	pixel_shader_param float_params 0.6
    uv_scale 0.125
	vertex_shader_param inverse
	vertex_shader_param camera
 }
}

temple_wall5


{
 {

	map textures/temple/textures/wall_clean05.png
	map textures/temple/textures/stone01_n.png
	map textures/black.png
	map textures/temp_textures/temple/new_temple_wall_d.png
	map textures/temp_textures/temple/new_temple_wall_n.png
	map textures/black.png
	map textures/temple/masks/blend_mask03.png
	material_id 40
	vertex_shader tile.vs.cso 111 NGT
	pixel_shader tileblend2db.ps.cso
	pixel_shader_param float_params 0.2
    uv_scale 0.125
	vertex_shader_param inverse
	vertex_shader_param camera
 }
}

temple_wall7
{
	{
		map textures/temp_textures/temple/new_temple_wall_d.png
		map textures/temp_textures/temple/new_temple_wall_n.png
		map textures/black.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.0625
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}



temple_wall8
{
 {

	map textures/temp_textures/temple/new_temple_wall_d.png
	map textures/temp_textures/temple/new_temple_wall_n.png
	map textures/black.png
	map textures/temple/textures/wall_clean01.png
	map textures/temple/textures/stone01_n.png
	map textures/black.png
	map textures/temple/masks/blend_mask05.png
	material_id 40
	vertex_shader tile.vs.cso 111 NGT
	pixel_shader tileblend2dc.ps.cso
	pixel_shader_param float_params 0.3 
    uv_scale 0.125
	vertex_shader_param inverse
	vertex_shader_param camera
 }
}

temple_floor_polished
{
	{
		map textures/temp_textures/temple/new_temple_floor_d.png
		map textures/temp_textures/temple/new_temple_floor_n.png
		map textures/temp_textures/temple/new_temple_floor_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.125
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}


// {
 // {

		// map textures/temp_textures/temple/new_temple_floor_d.png
		// map textures/temp_textures/temple/new_temple_floor_n.png
		// map textures/temp_textures/temple/new_temple_floor_s.png
  // map textures/temp_textures/temple/sandwaveless_d.png
  // map textures/temp_textures/temple/sandwaveless_n.png
  // map textures/temp_textures/dirt_s.png
	// map textures/temple/masks/blend_mask03.png
	// material_id 40
	// vertex_shader tile.vs.cso 111 NGT
	// pixel_shader tileblend2dc.ps.cso
	// pixel_shader_param float_params 0.3
    // uv_scale 0.125
	// vertex_shader_param inverse
	// vertex_shader_param camera
 // }
// }

temple_floor_checker

{
	{
		map textures/temp_textures/temple/checker_stone_d.png
		map textures/temp_textures/temple/checker_stone_n.png
		map textures/black.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.125
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}

temple_wall9

{
 {

	map textures/temple/textures/wall_clean05.png
	map textures/temple/textures/stone01_n.png
	map textures/black.png
	map textures/temp_textures/temple/temple_wall_d.png
	map textures/temp_textures/temple/temple_wall_n.png
	map textures/temp_textures/temple/temple_wall_s.png
	map textures/temple/masks/blend_mask03.png
	material_id 20
	vertex_shader tile.vs.cso 111 NGT
	pixel_shader tileblend2db.ps.cso
	pixel_shader_param float_params 0.2
    uv_scale 0.18
	vertex_shader_param inverse
	vertex_shader_param camera
 }
}
temple_wall10
{
	{
		map textures/temp_textures/temple/temple_wall_d.png
		map textures/temp_textures/temple/temple_wall_n.png
		map textures/temp_textures/temple/temple_wall_s.png
		//map textures/metal.png
		material_id 20
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.18
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}

temple_plaster_01
{
	{
		map textures/temp_textures/temple/temple_plaster01_d.png
		map textures/temp_textures/temple/temple_plaster_n.png
		map textures/black.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.0625
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}

temple_plaster_02
{
	{
		map textures/temp_textures/temple/temple_plaster02_d.png
		map textures/temp_textures/temple/temple_plaster_n.png
		map textures/black.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.0625
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}

temple_plaster_03
{
	{
		map textures/temp_textures/temple/temple_plaster03_d.png
		map textures/temp_textures/temple/temple_plaster_n.png
		map textures/black.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.0625
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}
temple_plaster_04
{
	{
		map textures/temp_textures/temple/temple_plaster04_d.png
		map textures/temp_textures/temple/temple_plaster_n.png
		map textures/black.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.0625
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}

temple_plaster_05
{
	{
		map textures/temp_textures/temple/temple_plaster05_d.png
		map textures/temp_textures/temple/temple_plaster_n.png
		map textures/black.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.0625
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}


temple_stonemetal
{
	{
		map textures/temp_textures/temple/temple_stonemetal_d.png
		map textures/temp_textures/temple/temple_stonemetal_n.png
		map textures/temp_textures/temple/temple_stonemetal_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.25
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}

temple_girder
{
	{
		map textures/temp_textures/temple/temple_girder_d.png
		map textures/temp_textures/temple/temple_girder_n.png
		map textures/temp_textures/temple/temple_girder_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.125
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}

temple_girder2
{
	{
		map textures/temp_textures/temple/temple_girder2_d.png
		map textures/temp_textures/temple/temple_girder2_n.png
		map textures/black.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.125
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}

//---------------

temple_plaster_prop
{
	{
		map textures/temp_textures/temple/temple_plaster01_d.png
		map textures/temp_textures/temple/temple_plaster_n.png
		map textures/black.png
		map textures/metal.png
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}

temple_wood
{
	{
		map textures/temp_textures/temple/wood_d.png
		map textures/temp_textures/temple/wood_n.png
		map textures/temp_textures/temple/wood_s.png
		material_id 20
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.25
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}
