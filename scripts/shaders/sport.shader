//wall

sport_floor

{
 {
		map textures/temp_textures/sport/sport_floor_d.png
		map textures/flat_normal.png
		map textures/temp_textures/metalplates_floor_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.125
 }
}
sport_floor2

{
 {
		map textures/temp_textures/sport/sport_floor2_d.png
		map textures/flat_normal.png
		map textures/temp_textures/metalplates_floor_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.125
 }
}
sport_floor3

{
 {
		map textures/temp_textures/sport/sport_floor3_d.png
		map textures/temp_textures/sport/sport_floor3_n.png
		map textures/temp_textures/metalplates_floor_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.0625
 }
}
sport_wall

{
 {
		map textures/temp_textures/sport/sport_wall_d.png
		map textures/flat_normal.png
		map textures/temp_textures/metalplates_floor_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.125
 }
}

sport_roof

{
 {
		map textures/temp_textures/sport/sport_roof_d.png
		map textures/flat_normal.png
		map textures/temp_textures/metalplates_floor_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.125
 }
}

sport_dark

{
 {
		map textures/temp_textures/sport/sport_roof_d.png
		map textures/flat_normal.png
		map textures/temp_textures/metalplates_floor_s.png
		material_id 40
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}