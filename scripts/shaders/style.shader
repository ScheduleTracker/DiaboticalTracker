yellow_border
{
	{
		map textures/style/yellow.png
		map textures/flat_normal.png
		map textures/black.png
		map textures/metal.png
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}

inc_border
{
	{
		map textures/temp_textures/inc_style_d.png
		map textures/flat_normal.png
		map textures/black.png
		map textures/metal.png
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}

metal_border
{
	{
		map textures/graydark.png
		map textures/flat_normal.png
		map textures/gray50.png
		map textures/metal.png
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}

border_temple
{
	{
		map textures/style/border_d.png
		map textures/style/border_n.png
		map textures/style/border_s.png
		map textures/metal
		material_id 103
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}