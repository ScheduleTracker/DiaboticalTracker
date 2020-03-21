// DRUMMER

drummer_mat_blinn1
{
	{
		map textures/drum.png
		map textures/flat_normal.png
		map textures/drum_s.png
		map textures/drum_i.png
		material_id 103
		vertex_shader tilestatic.vs.cso 111 NGT
		//vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}

drummer_mat_sticks
{
	{
		map textures/beige.png
		map textures/flat_normal.png
		map textures/black.png
		map textures/black.png
		material_id 103
		vertex_shader tilestatic.vs.cso 111 NGT
		//vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}
drummer_mat_rig_eggbot_eggbot_mat1_arms
{
	{
		map textures/eggbot_uvset1_bomb_d.png
		map textures/eggbot_uvset1_n.png
		map textures/eggbot_uvset1_s.png
		map textures/eggbot_uvset1_i.png
		material_id 106
		//vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		vertex_shader_param bones
		pixel_shader tile.ps.cso
	}
}

drummer_mat_rig_eggbot_eggbot_mat4_armorshell
{
	{
		map textures/eggbot_uvset4_bomb_d.png
		map textures/eggbot_uvset4_bomb_n.png
		map textures/eggbot_uvset4_s.png
		map textures/black.png
		material_id 106
		//vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		vertex_shader_param bones
		pixel_shader tile.ps.cso
	}
}

drummer_mat_rig_eggbot_eggbot_mat2_body
{
	{
		map textures/eggbot_uvset2_d.png
		map textures/eggbot_uvset2_n.png
		map textures/eggbot_uvset2_s.png
		map textures/eggbot_uvset2_i.png
		material_id 106
		//vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		vertex_shader_param bones
		pixel_shader tile.ps.cso
	}
}

drummer_mat_rig_eggbot_eggbot_mat3_legs
{
	{
		map textures/eggbot_uvset3_bomb_d.png
		map textures/eggbot_uvset3_n.png
		map textures/eggbot_uvset3_s.png
		map textures/eggbot_uvset3_i.png
		material_id 106
		//vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		vertex_shader_param bones
		pixel_shader tile.ps.cso
	}
}

// SINGER

singer_mat_mic
{
	{
		map textures/mic.png
		map textures/flat_normal.png
		map textures/black.png
		map textures/black.png
		material_id 103
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}

singer_mat_guitar4_lambert2
{
	{
		map textures/props_atlas_03_d.png
		map textures/props_atlas_03_n.png
		map textures/props_atlas_03_s.png
		map textures/props_atlas_03_i.png
		material_id 103
		vertex_shader tilestatic.vs.cso 111 NGT
		//vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}

singer_mat_rig_eggbot_guitar_eggbot_mat1_arms
{
	{
		map textures/eggbot_uvset1_bass_d.png
		map textures/eggbot_uvset1_n.png
		map textures/eggbot_uvset1_s.png
		map textures/eggbot_uvset1_i.png
		material_id 106
		//vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		vertex_shader_param bones
		pixel_shader tile.ps.cso
	}
}

singer_mat_rig_eggbot_guitar_eggbot_mat4_armorshell
{
	{
		map textures/eggbot_uvset4_bass_d.png
		map textures/eggbot_uvset4_bass_n.png
		//map textures/eggbot_uvset4_bass_s.png
                map textures/black.png
		map textures/black.png
		material_id 106
		//vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		vertex_shader_param bones
		pixel_shader tile.ps.cso
	}
}

singer_mat_rig_eggbot_guitar_eggbot_mat2_body
{
	{
		map textures/eggbot_uvset2_d.png
		map textures/eggbot_uvset2_n.png
		map textures/eggbot_uvset2_s.png
		map textures/eggbot_uvset2_i.png
		material_id 106
		//vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		vertex_shader_param bones
		pixel_shader tile.ps.cso
	}
}

singer_mat_rig_eggbot_guitar_eggbot_mat3_legs
{
	{
		map textures/eggbot_uvset3_bass_d.png
		map textures/eggbot_uvset3_n.png
		map textures/eggbot_uvset3_s.png
		map textures/eggbot_uvset3_i.png
		material_id 106
		//vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		vertex_shader_param bones
		pixel_shader tile.ps.cso
	}
}

floatingspotlight
{
	{
		map textures/floatingSpotlight_d.png
		map textures/floatingSpotlight_n.png
		map textures/floatingSpotlight_s.png
		map textures/floatingSpotlight_i.png
		material_id 103
		vertex_shader tilestatic.vs.cso 111 NGT
		//vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}

// GUITARIST

guitarist_mat_guitar3_lambert2
{
	{
		map textures/props_atlas_03_d.png
		map textures/props_atlas_03_n.png
		map textures/props_atlas_03_s.png
		map textures/props_atlas_03_i.png
		material_id 103
		vertex_shader tilestatic.vs.cso 111 NGT
		//vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}

guitarist_mat_guitar_arms
{
	{
		map textures/eggbot_uvset1_rocker_d.png
		map textures/eggbot_uvset1_n.png
		map textures/eggbot_uvset1_s.png
		map textures/eggbot_uvset1_i.png
		material_id 106
		//vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		vertex_shader_param bones
		pixel_shader tile.ps.cso
	}
}

guitarist_mat_guitar_armorshell
{
	{
		map textures/eggbot_uvset4_rocker_d.png
		map textures/eggbot_uvset4_rocker_n.png
		map textures/eggbot_uvset4_rocker_s.png
		map textures/black.png
		material_id 106
		//vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		vertex_shader_param bones
		pixel_shader tile.ps.cso
	}
}

guitarist_mat_guitar_body
{
	{
		map textures/eggbot_uvset2_d.png
		map textures/eggbot_uvset2_n.png
		map textures/eggbot_uvset2_s.png
		map textures/eggbot_uvset2_i.png
		material_id 106
		//vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		vertex_shader_param bones
		pixel_shader tile.ps.cso
	}
}

guitarist_mat_guitar_eggbot_legs
{
	{
		map textures/eggbot_uvset3_rocker_d.png
		map textures/eggbot_uvset3_n.png
		map textures/eggbot_uvset3_s.png
		map textures/eggbot_uvset3_i.png
		material_id 106
		//vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		vertex_shader_param bones
		pixel_shader tile.ps.cso
	}
}

glasses
{
	{
		map textures/glasses_d.png
		map textures/glasses_n.png
		map textures/matte.png
		map textures/black.png
		material_id 103
		vertex_shader tilestatic.vs.cso 111 NGT
		//vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}