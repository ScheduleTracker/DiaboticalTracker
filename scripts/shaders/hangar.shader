prop_spaceship_alt_mat_spaceship_circleplatform
{
	{
		map textures/platform_d.png
		map textures/platform_n.png
		map textures/platform_s.png
		map textures/black.png
		material_id 103
		vertex_shader tilestatic.vs.cso 111 NGT
		//vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		//vertex_shader_param bones
		pixel_shader tile.ps.cso
	}
}

prop_spaceship_alt_mat_spaceship_cables
{
	{
		map textures/gray50.png
		map textures/flat_normal.png
		map textures/black.png
		map textures/black.png
		material_id 103
		vertex_shader tilestatic.vs.cso 111 NGT
		//vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		//vertex_shader_param bones
		pixel_shader tile.ps.cso
	}
}


prop_spaceship_alt_mat_spaceship_container
{
	{
		map textures/container_crimson_d.png
		map textures/container_n.png
		map textures/container_s.png
		map textures/black.png
		material_id 103
		vertex_shader tilestatic.vs.cso 111 NGT
		//vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		//vertex_shader_param bones
		pixel_shader tile.ps.cso
	}
}

prop_spaceship_alt_mat_spaceship_crane
{
	{
		map textures/prop_crane_d.png
		map textures/prop_crane_n.png
		map textures/black.png
		map textures/black.png
		material_id 103
		vertex_shader tilestatic.vs.cso 111 NGT
		//vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		//vertex_shader_param bones
		pixel_shader tile.ps.cso
	}
}


prop_spaceship_alt_mat_spaceship_odcs
{
	{
		map textures/odcs_alt_d.png
		map textures/odcs_n.png
		map textures/odcs_s.png
		map textures/black.png
		material_id 103
		vertex_shader tilestatic.vs.cso 111 NGT
		//vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		//vertex_shader_param bones
		pixel_shader tile.ps.cso
	}
}

prop_spaceship_alt_mat_spaceship_railgun
{
	{
		//map textures/railgun_spaceship_d.png
		map textures/railgun_spaceship_alt_d.png
		//map textures/graydark.png
		map textures/railgun_n.png
		map textures/railgun_s.png
		map textures/black.png
		material_id 103
		vertex_shader tilestatic.vs.cso 111 NGT
		//vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		//vertex_shader_param bones
		pixel_shader tile.ps.cso
	}
}


prop_spaceship_alt_mat_spaceship_shotgun
{
	{
		//map textures/shotgun_spaceship_d.png
		map textures/shotgun_spaceship_alt_d.png
		//map textures/red.png
		map textures/weapon_sg_n.png
		map textures/weapon_sg_s.png
		map textures/black.png
		material_id 103
		vertex_shader tilestatic.vs.cso 111 NGT
		//vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		vertex_shader_param bones
		pixel_shader tile.ps.cso
	}
}

prop_spaceship_alt_mat_spaceship_shielddoor
{
	{
		map textures/props_atlas_03_d.png
		//map textures/darkgray.png
		map textures/props_atlas_03_n.png
		map textures/black.png
		map textures/black.png
		material_id 103
		vertex_shader tilestatic.vs.cso 111 NGT
		//vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		//vertex_shader_param bones
		pixel_shader tile.ps.cso
	}
}

props_atlas_hangar
{
	{
		map textures/props_atlas_hangar_d.png
		map textures/props_atlas_n.png
		map textures/props_atlas_s.png
		map textures/props_atlas_i.png
		material_id 40
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}


hangar_main
{
	{
        map textures/gray2.png
		map textures/flat_normal.png
		map textures/black.png
		map textures/black.png
		material_id 20
		vertex_shader tile.vs.cso 111 NGT
		vertex_shader_param camera
		pixel_shader tile.ps.cso		

	}
}
hangar_accent
{
	{
        map textures/crimson.png
		map textures/flat_normal.png
		map textures/black.png
		map textures/black.png
		material_id 20
		vertex_shader tile.vs.cso 111 NGT
		vertex_shader_param camera
		pixel_shader tile.ps.cso		

	}
}
arc_pillar_alt
{
	{
		map textures/gray_darker.png
		map textures/props_atlas_n.png
		map textures/black.png
		map textures/black.png
		material_id 40
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}
arc_pillar_shiny_alt
{
	{
		map textures/gray_darker.png
		map textures/props_atlas_n.png
		map textures/gray50.png
		map textures/black.png
		material_id 40
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}

prop_concrete_hangar
{
	{
		map textures/concrete_hangar_d.png
		map textures/concrete_n.png
		map textures/concrete_s.png
		map textures/black
		material_id 40
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}

coin
{
	{
		map textures/coin_d.png
		map textures/coin_n.png
		map textures/coin_s.png
		map textures/black.png
		material_id 106
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}

grayprop
{
	{
		map textures/gray50.png
		map textures/flat_normal.png
		map textures/black.png
		map textures/black.png
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso	
	}
}

blackmatte
{
	{
		map textures/black.png
		map textures/flat_normal.png
		map textures/black.png
		map textures/black.png
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso	
	}
}