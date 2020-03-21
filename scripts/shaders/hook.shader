ability_hook_mat_uvset1
{
	{
		map textures/eggbot_uvset1_dignitas_d.png
		map textures/eggbot_uvset1_n.png
		map textures/eggbot_uvset1_s.png
		map textures/eggbot_uvset1_i.png
		material_id 106
		vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		vertex_shader_param bones
		pixel_shader tile.ps.cso
	}
}

ability_hook_mat_uvset1_hand
{
    visible false
	{
		map textures/eggbot_uvset1_dignitas_d.png
		map textures/eggbot_uvset1_n.png
		map textures/eggbot_uvset1_s.png
		map textures/eggbot_uvset1_i.png
		material_id 106
		vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		vertex_shader_param bones
		pixel_shader tile.ps.cso
	}
}
