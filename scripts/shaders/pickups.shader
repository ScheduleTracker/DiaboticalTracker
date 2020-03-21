
doubledamage-nop
{
	{
		map textures/pickups/doubledamage_d.png
		map textures/pickups/doubledamage_n.png
		map textures/pickups/doubledamage_s.png
		map textures/pickups/doubledamage_i.png
		material_id 40
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tilemask.ps.cso
	}
}

powerjump
{
	{
		map textures/pickups/powerjump_d.png
		map textures/pickups/powerjump_n.png
		map textures/pickups/gray.png
		map textures/pickups/powerjump_i.png
		material_id 106
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}

armorNOP
{
	{
		map textures/pickups/MediumArmorPickup_D.png
		map textures/pickups/MediumArmorPickup_N.png
		map textures/pickups/MediumArmorPickup_S.png
		material_id 106
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}

smallarmorNOP
{
	{
		map textures/pickups/SmallArmorPickup_D.png
		map textures/pickups/SmallArmorPickup_N.png
		map textures/pickups/SmallArmorPickup_S.png
		material_id 106
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}

flag
{
	{
		map textures/pickups/flag_d.png
		map textures/pickups/flag_n.png
		map textures/pickups/flag_s.png
		map textures/pickups/flag_i.png
		material_id 103
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}


armort1_nop
{
	{
		map textures/pickups/SmallArmorPickup_D.png
		map textures/pickups/SmallArmorPickup_N.png
		map textures/pickups/SmallArmorPickup_S.png
		material_id 106
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}

armort2
{
	{
		map textures/pickups/yellowarmor_d.png
		map textures/SmallArmorPickup_N.png
		map textures/SmallArmorPickup_S.png
		material_id 106
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}


armort3
{
	{
		map textures/pickups/redarmor_d.png
		map textures/SmallArmorPickup_N.png
		map textures/SmallArmorPickup_S.png
		map textures/pickups/black.png
		material_id 106
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}


hpt1
{
	{
		map textures/pickups/hpt1_d.png
		map textures/flat_normal.png
		map textures/graydark.png
		//map textures/black.png
		map textures/black.png
		material_id 106
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}
hpt2
{
	{
		map textures/pickups/hpt2_d.png
		map textures/flat_normal.png
		map textures/graydark.png
		//map textures/black.png
		map textures/black.png
		material_id 106
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}

hpt3
{
	{
		map textures/pickups/hpt3_d.png
		map textures/flat_normal.png
		map textures/graydark.png
		//map textures/black.png
		map textures/black.png
		material_id 106
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}

hpt1_mat_cross_in
{
	{
		map textures/pickups/hpt1_d.png
		map textures/flat_normal.png
		map textures/graydark.png
		//map textures/black.png
		map textures/black.png
		material_id 80
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}
hpt1_mat_cross_out
{
	{
		map textures/pickups/hpt1_cage.png
		vertex_shader statictrans.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		vertex_shader_param look_and_time
		pixel_shader statictranstex.ps.cso
		pixel_shader_param float_params 0 0.2 0.3
		blendfunc blend

	}
}
hpt2_mat_cross_in
{
	{
		map textures/pickups/hpt2_d.png
		map textures/flat_normal.png
		map textures/graydark.png
		//map textures/black.png
		map textures/black.png
		material_id 80
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}
hpt2_mat_cross_out
{
	{
		map textures/pickups/hpt2_cage.png
		vertex_shader statictrans.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		vertex_shader_param look_and_time
		pixel_shader statictranstex.ps.cso
		pixel_shader_param float_params 0 0.2 0.3
		blendfunc blend

	}
}
hpt3_mat_cross_in
{
	{
		map textures/pickups/hpt3_d.png
		map textures/flat_normal.png
		map textures/graydark.png
		//map textures/black.png
		map textures/black.png
		material_id 80
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}
hpt3_mat_cross_out
{
	{
		map textures/pickups/hpt3_cage.png
		vertex_shader statictrans.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		vertex_shader_param look_and_time
		pixel_shader statictranstex.ps.cso
		pixel_shader_param float_params 0 0.2 0.3
		blendfunc blend

	}
}
crystalt1
{
	{
		map textures/pickups/crystal_d.png
		map textures/flat_normal.png
		map textures/white.png
		map textures/black.png
		material_id 40
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}

crystalt2
{
	{
		map textures/pickups/crystal_d.png
		map textures/flat_normal.png
		map textures/white.png
		map textures/black.png
		material_id 40
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}

crystalt3
{
	{
		map textures/pickups/crystal_d.png
		map textures/flat_normal.png
		map textures/white.png
		map textures/black.png
		material_id 40
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}


///////WEAPON

ammorl
{
	{
		map textures/weapon/rl_diffuse.png
		map textures/weapon/rl_normal.png
		map textures/weapon/rl_specular.png
		map textures/weapon/rl_i.png
		//map textures/weapon/black.png
		material_id 40
		vertex_shader tilestatic.vs.cso 111 NGT
		//vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		//vertex_shader_param material_id
		//vertex_shader_param bones
		pixel_shader tile.ps.cso
		//pixel_shader entity.ps.cso
	}
}
ammopncr
{
	{
		map textures/weapon/pncr_d.png
		map textures/weapon/pncr_n.png
		map textures/weapon/pncr_s.png
		map textures/weapon/pncr_i.png
		//map textures/weapon/black.png
		material_id 60
		vertex_shader tilestatic.vs.cso 111 NGT
		//vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		//vertex_shader_param material_id
		//vertex_shader_param bones
		pixel_shader tile.ps.cso
		//pixel_shader entity.ps.cso
	}
}

ammovc
{
	{
		map textures/weapon/vc_d.png
		map textures/weapon/vc_n.png
		map textures/weapon/vc_s.png
		map textures/weapon/vc_i.png
		//map textures/weapon/black.png
		material_id 60
		vertex_shader tilestatic.vs.cso 111 NGT
		//vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		//vertex_shader_param material_id
		//vertex_shader_param bones
		pixel_shader tile.ps.cso
		//pixel_shader entity.ps.cso
	}
}

ammogl
{
	{
		map textures/weapon/gl_d.png
		map textures/weapon/gl_n.png
		map textures/weapon/gl_s.png
		map textures/weapon/gl_i.png
		//map textures/weapon/black.png
		material_id 60
		vertex_shader tilestatic.vs.cso 111 NGT
		//vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		//vertex_shader_param material_id
		//vertex_shader_param bones
		pixel_shader tile.ps.cso
		//pixel_shader entity.ps.cso
	}
}

ammodf
{
	{
		map textures/weapon/df_d.png
		map textures/weapon/df_n.png
		map textures/weapon/df_s.png
	    map textures/weapon/df_i.png
		//map textures/weapon/black.png
		material_id 60
		vertex_shader tilestatic.vs.cso 111 NGT
		//vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		//vertex_shader_param material_id
		//vertex_shader_param bones
		pixel_shader tile.ps.cso
		//pixel_shader entity.ps.cso
	}
}
ammoss
{
	{
		map textures/weapon/ss_d.png
		map textures/weapon/ss_n.png
		map textures/weapon/ss_s.png
		map textures/weapon/ss_i.png
                //map textures/weapon/black.png
                material_id 40
		vertex_shader tilestatic.vs.cso 111 NGT
		//vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		//vertex_shader_param material_id
		//vertex_shader_param bones
		pixel_shader tile.ps.cso
		//pixel_shader entity.ps.cso
	}
}

//obsolete

ammovc
{
	{
		map textures/weapon/red.png
		map textures/weapon/flat_normal.png
		map textures/weapon/black.png
		material_id 106
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}
ammogl
{
	{
		map textures/weapon/blue.png
		map textures/weapon/flat_normal.png
		map textures/weapon/black.png
		material_id 106
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}
ammomg
{
 {
  map textures/pickups/ammo_box_d.png
  map textures/pickups/ammo_box_n.png
  map textures/pickups/ammo_box_s.png
  map textures/pickups/ammo_box_i.png
  map textures/pickups/ammo_box_c.png
  vertex_shader tilestatic.vs.cso 111 NGT
  vertex_shader_param inverse
  vertex_shader_param camera
  pixel_shader tilemask.ps.cso
  pixel_shader_param accent1 0.24 0.21 0.19
  pixel_shader_param accent2 0.02 0.74 0.58
  pixel_shader_param accent3 0.02 0.74 0.58
 }
}

ammowwss
{
 {
  map textures/pickups/ammo_box_d.png
  map textures/pickups/ammo_box_n.png
  map textures/pickups/ammo_box_s.png
  map textures/pickups/ammo_box_i.png
  map textures/pickups/ammo_box_c.png
  vertex_shader tilestatic.vs.cso 111 NGT
  vertex_shader_param inverse
  vertex_shader_param camera
  pixel_shader tilemask.ps.cso
  pixel_shader_param accent1 0.24 0.21 0.19
  pixel_shader_param accent2 0.60 0.77 0.30
  pixel_shader_param accent3 0.60 0.77 0.30
 }
}

ammodf
{
 {
  map textures/pickups/ammo_box_d.png
  map textures/pickups/ammo_box_n.png
  map textures/pickups/ammo_box_s.png
  map textures/pickups/ammo_box_i.png
  map textures/pickups/ammo_box_c.png
  vertex_shader tilestatic.vs.cso 111 NGT
  vertex_shader_param inverse
  vertex_shader_param camera
  pixel_shader tilemask.ps.cso
  pixel_shader_param accent1 0.24 0.21 0.19
  pixel_shader_param accent2 0.80 0.69 0
  pixel_shader_param accent3 0.80 0.69 0
 }
}

ammorl
{
 {
  map textures/pickups/ammo_box_d.png
  map textures/pickups/ammo_box_n.png
  map textures/pickups/ammo_box_s.png
  map textures/pickups/ammo_box_i.png
  map textures/pickups/ammo_box_c.png
  vertex_shader tilestatic.vs.cso 111 NGT
  vertex_shader_param inverse
  vertex_shader_param camera
  pixel_shader tilemask.ps.cso
  pixel_shader_param accent1 0.24 0.21 0.19	
  pixel_shader_param accent2 0.87 0.12 0.17
  pixel_shader_param accent3 0.87 0.12 0.17
 }
}

ammopncr
{
 {
  map textures/pickups/ammo_box_d.png
  map textures/pickups/ammo_box_n.png
  map textures/pickups/ammo_box_s.png
  map textures/pickups/ammo_box_i.png
  map textures/pickups/ammo_box_c.png
  vertex_shader tilestatic.vs.cso 111 NGT
  vertex_shader_param inverse
  vertex_shader_param camera
  pixel_shader tilemask.ps.cso
  pixel_shader_param accent1 0.24 0.21 0.19
  pixel_shader_param accent2 0.15 0.66 0.81
  pixel_shader_param accent3 0.15 0.66 0.81
 }
}

ammovc
{
 {
  map textures/pickups/ammo_box_d.png
  map textures/pickups/ammo_box_n.png
  map textures/pickups/ammo_box_s.png
  map textures/pickups/ammo_box_i.png
  map textures/pickups/ammo_box_c.png
  vertex_shader tilestatic.vs.cso 111 NGT
  vertex_shader_param inverse
  vertex_shader_param camera
  pixel_shader tilemask.ps.cso
  pixel_shader_param accent1 0.24 0.21 0.19
  pixel_shader_param accent2 0.48 0.38 0.82
  pixel_shader_param accent3 0.48 0.38 0.82
 }
}


ammogl
{
 {
  map textures/pickups/ammo_box_d.png
  map textures/pickups/ammo_box_n.png
  map textures/pickups/ammo_box_s.png
  map textures/pickups/ammo_box_i.png
  map textures/pickups/ammo_box_c.png
  vertex_shader tilestatic.vs.cso 111 NGT
  vertex_shader_param inverse
  vertex_shader_param camera
  pixel_shader tilemask.ps.cso
  pixel_shader_param accent1 0.24 0.21 0.19
  pixel_shader_param accent2 0.87 0.61 0.12
  pixel_shader_param accent3 0.87 0.61 0.12
 }
}
