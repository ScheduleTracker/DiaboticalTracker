
weapon_rl_bobblehead_mat_rocketlauncher
{
	{
		map textures/weapon/rl_diffuse.png
		map textures/weapon/rl_normal.png
		map textures/weapon/rl_specular.png
		map textures/weapon/rl_i.png
		//map textures/black.png
		material_id 40
		//vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		//vertex_shader_param material_id
		vertex_shader_param bones
		pixel_shader tile.ps.cso
		//pixel_shader entity.ps.cso
	}
}


weapon_rl_bobblehead_mat_display
{
	{
		map textures/weapon/rl_hologram.png
		map textures/flat_normal.png
		map textures/black.png
		map textures/black.png
		material_id 80
		vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		vertex_shader_param bones
	       pixel_shader tile.ps.cso
               //blendfunc blend
	}
}


weapon_rl_bobblehead_mat_bobblehead
{
	{
		map textures/attachment/bobblehead_d.png
		map textures/flat_normal.png
		map textures/black.png
		map textures/black.png
		//map textures/black.png
		material_id 40
		//vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		//vertex_shader_param material_id
		vertex_shader_param bones
		pixel_shader tile.ps.cso
		//pixel_shader entity.ps.cso
	}
}
