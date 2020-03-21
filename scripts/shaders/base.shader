//Material IDS:
//0 = default
//102 = overbright
//103 = 3rd map is glow map

inline_model
{
	{
		map textures/floor_02.png
		map textures/floor_02_n.png
		map textures/floor_02_s.png
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader inline_model.ps.cso
	}
}

floor_02
{
	{
		map textures/floor_02.png
		map textures/floor_02_n.png
		map textures/floor_02_s.png
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso
		
	}

}

floor_plate_01
{
	{
		map textures/floor_plate_01.png
		map textures/floor_plate_01_n.png
		map textures/floor_plate_01_s.png
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso
		
	}

}

grid1
{
	{
		map textures/grid1.png
		map textures/grid1-normal.png
		map textures/grid1-spec.png
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso
		
	}
}

		//panel_02_s.png
panel_02
{
	{
		map textures/panel_02.png
		map textures/panel_02_ultra1337c.png
		map textures/gray.png
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso		

	}
}


atlassimple
{
	{
        map textures/gray.png
		map textures/flat_normal.png
		map textures/black.png
		map textures/black.png
		material_id 65
		vertex_shader tile.vs.cso 111 NGT
		vertex_shader_param camera
		pixel_shader tile.ps.cso		

	}
}
orange
{
	{
        map textures/orange.png
		map textures/flat_normal.png
		map textures/black.png
		map textures/black.png
		material_id 20
		vertex_shader tile.vs.cso 111 NGT
		vertex_shader_param camera
		pixel_shader tile.ps.cso		

	}
}

floor10
{
	{
		map textures/Floor_DiamondPlateFlat_512_d.tga
		map textures/Floor_DiamondPlateFlat_512_n.tga
		map textures/Floor_DiamondPlateFlat_512_s.tga
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
	}
}
atlas001prop
{
	{
		map textures/atlas001.png
		map textures/atlas001_n.png
		map textures/atlas001_s.png
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}


style1
{
	{
		map textures/brick.png
		map textures/brick_n.png
		map textures/Noise3D.dds
		map textures/plaster.png
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tileblend.ps.cso		

	}
}

floor_incubator
{
	{
		map textures/FloorCube_Diffuse.tga
		map textures/FloorCube_Normal.tga
		map textures/FloorCube_Specual.tga
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso		

	}
}
pillar_full_wrong
{
	{
		map textures/pillar2_D.png
		map textures/pillar_N.png
		map textures/pillar_S.png
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso		

	}
}
panel_03
{
	{
		map textures/panel_03.png
		map textures/panel_03_n.png
		map textures/panel_03_s.png
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso
		
	}
}
panel_04
{
	{
		map textures/panel_04.png
		map textures/panel_04_n.png
		map textures/panel_04_s.png
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso
		
	}
}
panel_05
{
	{
		map textures/panel_05.png
		map textures/panel_05_n.png
		map textures/panel_05_s.png
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso
		
	}
}
tileset_01_01
{
	{
		map textures/tileset_01_01.png
		map textures/tileset_01_01_n.png
		map textures/tileset_01_01_s.png
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}
tileset_01_02
{
	{
		map textures/tileset_01_02.png
		map textures/tileset_01_02_n.png
		map textures/tileset_01_02_s.png
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}



plate2
{
	{
		map textures/plate1.png
		map textures/plate1-normal.png
		map textures/plate1-specular.png
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso
		
	}

}

plate1
{
	{
	map textures/FLOOR_3.png
	map textures/FLOOR_3_n.png
	map textures/FLOOR_3_s.png
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso
		
	}

}
default
{
	{
		map textures/white.png
		map textures/flat_normal.png
		map textures/white.png
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso
		
	}
}

terminal
{
	{
		map textures/xnormal_normals_occlusion.tga
		map textures/flat_normal.tga
		map textures/white.png
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso
		
	}
}

null
{
	{
		map textures/white.png
		map textures/white.png
		map textures/flat_normal.png
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso
		
	}
}

diagonal
{
	{
	map textures/FLOOR_3.png
	map textures/FLOOR_3_n.png
	map textures/FLOOR_3_s.png
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso
		
	}

}
holo
{
	{
	map textures/ceiling_fiber_d.rid
	map textures/ceiling_fiber_n.rid
	map textures/ceiling_fiber_s.rid
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
	
}
hex
{
	{
	map textures/Tile_LargeHexagon_512_d.rid
	map textures/Tile_LargeHexagon_512_n.rid
	map textures/Tile_LargeHexagon_512_s.rid
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso
		
	}

}

plate3
{
	{
		map textures/grid1.png
		map textures/grid1-normal.png
		map textures/grid1-spec.png
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso
		
	}

}

white
{
	{
		map textures/white.png
		map textures/flat_normal.png
		map textures/white.png
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso
		
	}

}

gray
{
	{
		map textures/gray50.png
		map textures/flat_normal.png
		map textures/black.png
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso
		
	}

}
black
{
	{
		map textures/black.png
		map textures/flat_normal.png
		map textures/gray.png
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso
		
	}

}
dark_gray
{
	{
		map textures/dark_gray.png
		map textures/flat_normal.png
		map textures/black.png
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso
		
	}

}

gray75
{
	{
		map textures/gray75.png
		map textures/flat_normal.png
		map textures/white.png
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso
		
	}

}
cube
{
	{
		map textures/gray75.png
		map textures/cube1_n.tga
		map textures/white.png
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso
		
	}

}


panel_06
{
	{
		map textures/grid_d.rid
		map textures/grid_n.rid
		map textures/grid_s.rid
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso
		
	}
}

panel_07
{
	{
		map textures/grate_d.rid
		map textures/grate_n.rid
		map textures/grate_s.rid
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso
		
	}
}

panel_08
{
	{
		map textures/plate_1_d.rid
		map textures/plate_1_n.rid
		map textures/plate_1_s.rid
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso
		
	}
}
atlas1
{
	{
		map textures/atlas1.png
		map textures/FLOOR_3_n.png
		map textures/FLOOR_3_s.png
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso
		
	}
}
atlas2
{
	{
		map textures/atlas2.png
		map textures/FLOOR_3_n.png
		map textures/FLOOR_3_s.png
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso
		
	}
}

body
{
	{
		map textures/body_dark_d.png
		map textures/flat_normal.png
		map textures/body_dark_s.png
		vertex_shader tileanim.vs.cso 111 NGTA
		//vertex_shader_param camera
		//vertex_shader animation.vs.cso 111 NGTA
		vertex_shader_param camera
		vertex_shader_param inverse
		vertex_shader_param bones
		pixel_shader tile.ps.cso
		//pixel_shader entity.ps.cso
	}
}
head
{
	{
		map textures/head_dark_d.png
		map textures/flat_normal.png
		map textures/head_dark_s.png
		vertex_shader tileanim.vs.cso 111 NGTA
		//vertex_shader animation.vs.cso 111 NGTA
		vertex_shader_param camera
		vertex_shader_param inverse
		vertex_shader_param bones
		pixel_shader tile.ps.cso
		//pixel_shader entity.ps.cso
	}
}
rocket
{
	{
		map textures/white.png
		map textures/flat_normal.png
		map textures/white.png
		vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param camera
		vertex_shader_param inverse
		vertex_shader_param bones
		pixel_shader tile.ps.cso

	}
}

engineer
{
	{
		map textures/EngineerDiffuse.tga
		map textures/EngineerNormal.tga
		map textures/EngineerSpecular.tga
		vertex_shader tilestatic.vs.cso 111 NGT
		//vertex_shader animation.vs.cso 111 NGTA
		vertex_shader_param camera
		vertex_shader_param inverse
		//vertex_shader_param bones
		pixel_shader tile.ps.cso
		//pixel_shader entity.ps.cso
	}
}

pillar_full
{
	{
		map textures/pillar2_D.png
		map textures/pillar_N.png
		map textures/pillar_S.png
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param camera
		vertex_shader_param inverse
		pixel_shader tile.ps.cso
	}
}

rl_geo
{
	{
		map textures/rl_diffuse.png
		map textures/rl_normal.png
		map textures/rl_specular.png
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param camera
		vertex_shader_param inverse
		pixel_shader tile.ps.cso
	}
}

default_model
{
	{
		map textures/gray.png
		map textures/flat_normal.png
		map textures/black.png
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param camera
		vertex_shader_param inverse
		pixel_shader tile.ps.cso
	}
}
auto_material
{
	{
		map textures/white.png
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
armor
{
	{
		map textures/MediumArmorPickup_D.png
		map textures/MediumArmorPickup_N.png
		map textures/MediumArmorPickup_S.png
		material_id 106
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}

flag_redOLD
{
	{
		map textures/flag_red.png
		map textures/LargeArmorPickup_N.png
		map textures/LargeArmorPickup_S.png
		material_id 106
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}
flag_blueOLD
{
	{
		map textures/flag_blue.png
		map textures/LargeArmorPickup_N.png
		map textures/LargeArmorPickup_S.png
		material_id 106
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}

bigarmorOP
{
	{
		map textures/LargeArmorPickup_D.png
		map textures/LargeArmorPickup_N.png
		map textures/LargeArmorPickup_S.png
		material_id 106
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}

fuseboxnop
{
	{
		map textures/Fusebox_Albedo.png
		map textures/Fusebox_normals.png
		map textures/black.png
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}

bighpNOP
{
	{
		map textures/hp.png
		map textures/flat_normal.png
		map textures/black.png
		material_id 106
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}







teleporter
{
	{
		map textures/Teleporter_Albedo.png
		map textures/Teleporter_Normal.png
		map textures/Teleporter_Gloss.png
		material_id 102
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}


arrow
{
	{
		map textures/green.png
		map textures/flat_normal.png
		map textures/black.png
		material_id 102
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}

skullbot
{
	{
		material_id 101
		map textures/skullbot_d.png
		map textures/skullbot_n.png
		map textures/skullbot_s.png
		vertex_shader tilestatic.vs.cso 111 NGT
		//vertex_shader animation.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		//vertex_shader_param bones
		pixel_shader tile.ps.cso
		//pixel_shader entity.ps.cso
	}
}
beam
{
	{
		map textures/white.png
		map textures/flat_normal.png
		map textures/black.png
		map textures/black.png
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}
beam2
{
	{
		map textures/white.png
		map textures/flat_normal.png
		map textures/black.png
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}

pillar
{
	{
		map textures/gray.png
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

herro
{
	{
		map textures/white.png
		map textures/flat_normal.png
		map textures/white.png
		map textures/black.png
		material_id 60
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}
eggbot
{
	{
		map textures/white.png
		map textures/flat_normal.png
		map textures/white.png
		vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param camera
		vertex_shader_param inverse
		vertex_shader_param bones
		pixel_shader tile.ps.cso
	}
}

eggbot_red
{
	{
		map textures/green.png
		map textures/flat_normal.png
		map textures/white.png
		material_id 102
		vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		vertex_shader_param bones
		pixel_shader tile.ps.cso
	}
}

eggbot_blue
{
	{
		map textures/blue.png
		map textures/flat_normal.png
		map textures/white.png
		material_id 102
		vertex_shader tileanim.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		vertex_shader_param bones
		pixel_shader tile.ps.cso
	}
}


bot_export
{
	{
		material_id 101
		map textures/gray.png
		map textures/skullbot_n.png
		map textures/white.png
		vertex_shader tilestatic.vs.cso 111 NGT
		//vertex_shader animation.vs.cso 111 NGTA
		vertex_shader_param camera
		vertex_shader_param material_id
		vertex_shader_param inverse
		//vertex_shader_param bones
		pixel_shader tile.ps.cso
		//pixel_shader entity.ps.cso
	}
}


arrownop
{
	{
		map textures/lightningGun_Db.png
		map textures/lightningGun_N.png
		map textures/lightningGun_G.png
		material_id 103
		vertex_shader tileanim.vs.cso 111 NGTA
		//vertex_shader animation.vs.cso 111 NGTA
		vertex_shader_param inverse
		vertex_shader_param camera
		vertex_shader_param bones
		pixel_shader tile.ps.cso
		//pixel_shader entity.ps.cso
	}
}

sky1
{
	{
	    map textures/earth_night_cubemap.dds
		vertex_shader skybox.vs.cso 3
		pixel_shader skybox.ps.cso
	}
}



White_AssaultRifle
{
	{
		material_id 101
		map textures/T_White_AssaultRifle_D.TGA
		map textures/T_White_AssaultRifle_N.TGA
		map textures/white.png
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param camera
		vertex_shader_param material_id
		vertex_shader_param inverse
		pixel_shader tile.ps.cso
	}
}

Darkness_AssaultRifle
{
	{
		material_id 101
		map textures/T_Darkness_AssaultRifle_D.TGA
		map textures/T_Darkness_AssaultRifle.TGA
		map textures/white.png
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param camera
		vertex_shader_param material_id
		vertex_shader_param inverse
		pixel_shader tile.ps.cso
	}
}

Darkness_RocketLauncher
{
	{
		material_id 101
		map textures/T_Darkness_RocketLauncher_D.TGA
		map textures/T_Darkness_RocketLauncher_N.TGA
		map textures/white.png
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param camera
		vertex_shader_param material_id
		vertex_shader_param inverse
		pixel_shader tile.ps.cso
	}
}

Darkness_RocketLauncher_Alt
{
	{
		material_id 101
		map textures/T_Darkness_RocketLauncher_D_Green.TGA
		map textures/T_Darkness_RocketLauncher_N.TGA
		map textures/white.png
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param camera
		vertex_shader_param material_id
		vertex_shader_param inverse
		pixel_shader tile.ps.cso
	}
}

Darkness_GrenadeLauncher
{
	{
		material_id 101
		map textures/T_Darkness_GrenadeLauncher_D.TGA
		map textures/T_Darkness_GrenadeLauncher_N.TGA
		map textures/white.png
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param camera
		vertex_shader_param material_id
		vertex_shader_param inverse
		pixel_shader tile.ps.cso
	}
}

Darkness_Shotgun
{
	{
		material_id 101
		map textures/T_Darkness_Shotgun_D.TGA
		map textures/T_Darkness_Shotgun_N.TGA
		map textures/white.png
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param camera
		vertex_shader_param material_id
		vertex_shader_param inverse
		pixel_shader tile.ps.cso
	}
}

Darkness_Shotgun_Heavy
{
	{
		material_id 101
		map textures/T_Darkness_Shotgun_D_Green.TGA
		map textures/T_Darkness_Shotgun_N.TGA
		map textures/white.png
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param camera
		vertex_shader_param material_id
		vertex_shader_param inverse
		pixel_shader tile.ps.cso
	}
}

White_Shotgun
{
	{
		material_id 101
		map textures/T_White_Shotgun_D.TGA
		map textures/T_White_Shotgun_N.TGA
		map textures/white.png
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param camera
		vertex_shader_param material_id
		vertex_shader_param inverse
		pixel_shader tile.ps.cso
	}
}


White_RocketLauncher
{
	{
		material_id 101
		map textures/T_White_RocketLauncher_D.TGA
		map textures/T_White_RocketLauncher_N.TGA
		map textures/white.png
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param camera
		vertex_shader_param material_id
		vertex_shader_param inverse
		pixel_shader tile.ps.cso
	}
}


reflect
{
	{
		map textures/orange.png
		map textures/flat_normal.png
		map textures/gray.png
		material_id 102
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}

swap
{
	{
		map textures/blue.png
		map textures/flat_normal.png
		map textures/gray.png
		material_id 102
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}
hook
{
	{
		map textures/cyan.png
		map textures/flat_normal.png
		map textures/gray.png
		material_id 102
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}
deathball
{
	{
		map textures/green.png
		map textures/flat_normal.png
		map textures/gray.png
		material_id 106
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}

// railgun
// {
	// {
		// map textures/railgun_d.png
		// map textures/railgun_n.png
		// map textures/railgun_s.png
		// map textures/black.png
		// material_id 40
		// vertex_shader tilestatic.vs.cso 111 NGT
		// vertex_shader_param inverse
		// vertex_shader_param camera
		// vertex_shader_param bones
		// pixel_shader tile.ps.cso

	// }
// }

