doubledamage-nop
{
	{
		map textures/doubledamage_d.png
		map textures/doubledamage_n.png
		map textures/doubledamage_s.png
		map textures/doubledamage_e.png
		material_id 106
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}

powerjump
{
	{
		map textures/powerjump_d.png
		map textures/powerjump_n.png
		map textures/gray.png
		map textures/powerjump_i.png
		material_id 106
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}

bigarmor
{
	{
		map textures/bigarmor_d.png
		map textures/bigarmor_n.png
		map textures/bigarmor_s.png
		map textures/black.png
		material_id 106
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}