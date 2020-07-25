core_eggbot_destruction_old
{
	{
		map textures/gray35.png
		map textures/flat_normal.png
		map textures/gray35.png
		map textures/black.png
		map textures/black.png
		material_id 45
		vertex_shader tilestatici.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tilemask.ps.cso
		pixel_shader_param accent1 505050
	}
}
