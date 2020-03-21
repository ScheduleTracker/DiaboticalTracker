flag_red
{
	{
		map textures/red.png
		map textures/flag_n.png
		map textures/flag_s.png
		map textures/flag_i.png
		material_id 103
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}

flag_blue
{
	{
		map textures/blue.png
		map textures/flag_n.png
		map textures/flag_s.png
		map textures/flag_i.png
		material_id 103
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}