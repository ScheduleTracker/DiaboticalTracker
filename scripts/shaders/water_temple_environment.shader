// temple_floor_test
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


water_temple_floor
{
 {
  map textures/temp_textures/water_temple/water_temple_floor_01_d.png
  map textures/temp_textures/water_temple/water_temple_floor_01_n.png
  map textures/temp_textures/water_temple/water_temple_floor_01_s.png
  //map textures/metal.png
    material_id 40
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.25
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}

water_temple_floor_small
{
 {
  map textures/temp_textures/water_temple/water_temple_floor_01_d.png
  map textures/temp_textures/water_temple/water_temple_floor_01_n.png
  map textures/temp_textures/water_temple/water_temple_floor_01_s.png
  //map textures/metal.png
    material_id 40
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.5
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}

water_temple_floor_big
{
 {
  map textures/temp_textures/water_temple/water_temple_floor_01_d.png
  map textures/temp_textures/water_temple/water_temple_floor_01_n.png
  map textures/temp_textures/water_temple/water_temple_floor_01_s.png
  //map textures/metal.png
    material_id 40
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.125
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}

water_temple_floor2
{
 {
  map textures/temp_textures/water_temple/water_temple_floor_02_d.png
  map textures/temp_textures/water_temple/water_temple_floor_01_n.png
  map textures/temp_textures/water_temple/water_temple_floor_01_s.png
  //map textures/metal.png
    material_id 40
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.25
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}

water_temple_floor_small2
{
 {
  map textures/temp_textures/water_temple/water_temple_floor_02_d.png
  map textures/temp_textures/water_temple/water_temple_floor_01_n.png
  map textures/temp_textures/water_temple/water_temple_floor_01_s.png
  //map textures/metal.png
    material_id 40
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.5
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}

water_temple_floor_big2
{
 {
  map textures/temp_textures/water_temple/water_temple_floor_02_d.png
  map textures/temp_textures/water_temple/water_temple_floor_01_n.png
  map textures/temp_textures/water_temple/water_temple_floor_01_s.png
  //map textures/metal.png
    material_id 40
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.125
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}

water_temple_wall
{
 {
  map textures/temp_textures/water_temple/water_temple_wall_01_d.png
  map textures/temp_textures/water_temple/water_temple_wall_01_n.png
  map textures/temp_textures/water_temple/water_temple_wall_01_s.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.125
  material_id 40

		vertex_shader_param inverse
		vertex_shader_param camera
	}
}

water_temple_wall2
{
 {
  map textures/temp_textures/water_temple/water_temple_wall_01_d.png
  map textures/temp_textures/water_temple/water_temple_floor_01_n.png
  map textures/temp_textures/water_temple/water_temple_wall_01_s.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.25
  material_id 40
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}

water_temple_decor

{
 {
  map textures/temp_textures/water_temple/water_temple_decor.png
  map textures/flat_normal.png
  map textures/temp_textures/water_temple/water_temple_floor_01_s.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.125
  material_id 40
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}