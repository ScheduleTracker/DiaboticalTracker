// checker
// {
	// {
		// map textures/temp_textures/checker01_d.png
		// map textures/temp_textures/metalplates_03_n.png
		// map textures/temp_textures/checker01_s.png
		// map textures/metal.png
		// vertex_shader tile.vs.cso 111 NGT
		// pixel_shader tile.ps.cso
		// uv_scale 0.25
	// }
// }


checker
{
 {
		map textures/temp_textures/checker01_d.png
		map textures/temp_textures/metalplates_03_n.png
		map textures/temp_textures/checker01_s.png
		map textures/temp_textures/metalplates_01_dirt.png
		map textures/flat_normal.png
		map textures/temp_textures/dirt_s.png
		map textures/temp_textures/noise_test2.png
		material_id 40
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tileblend2db.ps.cso
		pixel_shader_param float_params 0.25
        uv_scale 0.5
		vertex_shader_param inverse
		vertex_shader_param camera
 }
}


concrete_clean2
{
	{
		map textures/temp_textures/concrete_clean02_d.png
		map textures/temp_textures/concrete_clean02_n.png
		map textures/temp_textures/concrete_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.25
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}

concrete_stripes
{
	{
		map textures/temp_textures/concrete_stripes_d.png
		map textures/temp_textures/concrete_stripes_n.png
		map textures/temp_textures/concrete_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.25
	}
}

concrete_clean3
{
	{
		map textures/temp_textures/concrete_clean04_d.png
		map textures/temp_textures/concrete_clean02_n.png
		map textures/temp_textures/concrete_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.25
	}
}

concrete_clean4
{
	{
		map textures/temp_textures/concrete_clean05_d.png
		map textures/temp_textures/concrete_clean02_n.png
		map textures/temp_textures/concrete_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.25
	}
}

concrete_clean6
{
	{
		map textures/temp_textures/concrete_clean06_d.png
		map textures/temp_textures/concrete_clean02_n.png
		map textures/temp_textures/concrete_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.25
	}
}
bulletholes
{
	{
		map textures/temp_textures/bulletholes_d.png
		map textures/temp_textures/bulletholes_n.png
		map textures/temp_textures/concrete_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.25
	}
}

concrete_clean
{
	{
		map textures/temp_textures/concrete_clean_d.png
		map textures/temp_textures/concrete_clean_n.png
		map textures/temp_textures/concrete_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.25
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}

concrete_dirt_01
{
	{
		map textures/temp_textures/concrete_dirt_01_d.png
		map textures/temp_textures/concrete_clean_n.png
		map textures/temp_textures/concrete_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.5
	}
}

concrete_dirt_02
{
	{
		map textures/temp_textures/concrete_dirt_02_d.png
		map textures/temp_textures/concrete_clean_n.png
		map textures/temp_textures/concrete_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.25
	}
}

concrete_grid_01
{
	{
		map textures/temp_textures/concrete_grid_01_d.png
		map textures/temp_textures/concrete_grid_n.png
		map textures/temp_textures/concrete_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.25
	}
}

concrete_grid_02
{
	{
		map textures/temp_textures/concrete_grid_02_d.png
		map textures/temp_textures/concrete_grid_n.png
		map textures/temp_textures/concrete_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.25
	}
}

grip_flat
{
	{
		map textures/temp_textures/grip_flat_d.png
		map textures/flat_normal
		map textures/temp_textures/grip_flat_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.25
	}
}

scaffold
{
	{
		map textures/temp_textures/scaffold_d.png
		map textures/temp_textures/scaffold_n.png
		map textures/temp_textures/scaffold_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.33

	}
}

scaffold_simple
{
	{
		map textures/temp_textures/scaffold_simple_d.png
		map textures/temp_textures/scaffold_simple_n.png
		map textures/temp_textures/scaffold_simple_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.33
	}
}


floor_plate01
{
	{
		map textures/temp_textures/metalplates_01.png
		map textures/flat_normal.png
		map textures/temp_textures/metalplates_01_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.5
	}
}
floor_plate01b
{
	{

		map textures/temp_textures/metalplates_01.png
		map textures/flat_normal.png
		map textures/temp_textures/metalplates_01_s.png
		map textures/temp_textures/metalplates_01_dirt.png
		map textures/flat_normal.png
		map textures/temp_textures/dirt_s.png
		map textures/temp_textures/noise_test2.png
		material_id 40
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tileblend2db.ps.cso
		pixel_shader_param float_params 0.25
        uv_scale 0.5
		vertex_shader_param inverse
		vertex_shader_param camera
 }
}

floor_plate02
{
	{
		map textures/temp_textures/metalplates_02.png
		map textures/flat_normal.png
		map textures/temp_textures/metalplates_01_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.5
	}
}

floor_plate03
{
	{
		map textures/temp_textures/metalplates_03.png
		map textures/temp_textures/metalplates_03_n.png
		map textures/temp_textures/metalplates_03_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.5
	}
}

floor_plate03b
{
	{

		map textures/temp_textures/metalplates_03.png
		map textures/temp_textures/metalplates_03_n.png
		map textures/temp_textures/metalplates_03_s.png
		map textures/temp_textures/metalplates_01_dirt.png
		map textures/flat_normal.png
		map textures/temp_textures/dirt_s.png
		map textures/temp_textures/noise_test3.png
		material_id 40
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tileblend2db.ps.cso
		pixel_shader_param float_params 0.25
        uv_scale 0.5
		vertex_shader_param inverse
		vertex_shader_param camera
 }
}

floor_plate04
{
	{
		map textures/temp_textures/metalplates_04.png
		map textures/temp_textures/metalplates_03_n.png
		map textures/temp_textures/metalplates_03_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.5
	}
}

ventilation
{
	{
		map textures/temp_textures/vent_d.png
		map textures/temp_textures/vent_n.png
		map textures/temp_textures/vent_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.5
	}
}

concrete_straight01
{
	{
		map textures/temp_textures/concrete_straight_01_d.png
		map textures/temp_textures/concrete_straight_01_n.png
		map textures/temp_textures/concrete_straight_01_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.25
	}
}

concrete_straight02
{
	{
		map textures/temp_textures/concrete_straight_02_d.png
		map textures/temp_textures/concrete_straight_02_n.png
		map textures/temp_textures/concrete_straight_02_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.25
	}
}


metalwall_01
{
	{
		map textures/temp_textures/metalwall01_beige_d.png
		map textures/temp_textures/metalwall01_n.png
		map textures/temp_textures/metalwall_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.33
	}
}

metalwall_02
{
	{
		map textures/temp_textures/metalwall02_beige_d.png
		map textures/temp_textures/metalwall01_n.png
		map textures/temp_textures/metalwall_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.33
	}
}

metalwall_03
{
	{
		map textures/temp_textures/metalwall03_beige_d.png
		map textures/temp_textures/metalwall01_n.png
		map textures/temp_textures/metalwall_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.33
	}
}

metalwall_04
{
	{
		map textures/temp_textures/metalwall04_beige_d.png
		map textures/temp_textures/metalwall01_n.png
		map textures/temp_textures/metalwall_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.33
	}
}

metalwall_05
{
	{
		map textures/temp_textures/metalwall01_gray_d.png
		map textures/temp_textures/metalwall01_n.png
		map textures/temp_textures/metalwall_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.33
	}
}

metalwall_06
{
	{
		map textures/temp_textures/metalwall02_gray_d.png
		map textures/temp_textures/metalwall01_n.png
		map textures/temp_textures/metalwall_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.33
	}
}

metalwall_07
{
	{
		map textures/temp_textures/metalwall03_gray_d.png
		map textures/temp_textures/metalwall01_n.png
		map textures/temp_textures/metalwall_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.33
	}
}
metalwall_08
{
	{
		map textures/temp_textures/metalwall04_gray_d.png
		map textures/temp_textures/metalwall01_n.png
		map textures/temp_textures/metalwall_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.33
	}
}

metalwall_09
{
	{
		map textures/temp_textures/metalwall01_red_d.png
		map textures/temp_textures/metalwall01_n.png
		map textures/temp_textures/metalwall_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.33
	}
}

metalwall_10
{
	{
		map textures/temp_textures/metalwall02_red_d.png
		map textures/temp_textures/metalwall01_n.png
		map textures/temp_textures/metalwall_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.33
	}
}

metalwall_11
{
	{
		map textures/temp_textures/metalwall03_red_d.png
		map textures/temp_textures/metalwall01_n.png
		map textures/temp_textures/metalwall_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.33
	}
}

metalwall_12
{
	{
		map textures/temp_textures/metalwall04_red_d.png
		map textures/temp_textures/metalwall01_n.png
		map textures/temp_textures/metalwall_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.33
	}
}

metalwall_12
{
	{
		map textures/temp_textures/metalflat_gray_d.png
		map textures/flat_normal.png
		map textures/temp_textures/metalflat_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.33
	}
}

metalwall_13
{
	{
		map textures/temp_textures/metalwall01_blue_d.png
		map textures/temp_textures/metalwall01_n.png
		map textures/temp_textures/metalwall_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.33
	}
}


plate01
{
	{
		map textures/temp_textures/plate_d.png
		map textures/temp_textures/plate_n.png
		map textures/graydark.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.5
	}
}

plate02
{
	{
		map textures/temp_textures/plate02_d.png
		map textures/temp_textures/plate_n.png
		map textures/graydark.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.5
	}
}

plate03
{
	{
		map textures/temp_textures/plate03_d.png
		map textures/temp_textures/plate_n.png
		map textures/graydark.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.5
	}
}

stonewall
{
	{
		map textures/temp_textures/stone_d.png
		map textures/temp_textures/stone_n.png
		map textures/temp_textures/stone_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.5
	}
}


woodwall
{
	{
		map textures/temp_textures/wood_d.png
		map textures/temp_textures/wood_n.png
		map textures/graydark.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.5
	}
}

metal_border_01
{
	{
		map textures/temp_textures/metal_borders01_d.png
		map textures/temp_textures/metal_borders01_n.png
		map textures/graydark.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.25
	}
}


metal_plates_color
{
	{
		map textures/temp_textures/metal_plating_color_blue.png
		map textures/temp_textures/metal_plates_color01_n.png
		map textures/temp_textures/metal_plates_color01_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.25
	}
}

metal_plates_color2
{
	{
		map textures/temp_textures/metal_plating_color_red.png
		map textures/temp_textures/metal_plates_color01_n.png
		map textures/temp_textures/metal_plates_color01_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.25
	}
}

metal_plates_color3
{
	{
		map textures/temp_textures/metal_plating_color_green.png
		map textures/temp_textures/metal_plates_color01_n.png
		map textures/temp_textures/metal_plates_color01_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.25
	}
}



metallist01
{
	{
		map textures/temp_textures/metallist01_d.png
		map textures/temp_textures/metallist01_n.png
		map textures/graydark.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 1
	}
}

metallist02
{
	{
		map textures/temp_textures/metallist02_d.png
		map textures/temp_textures/metallist02_n.png
		map textures/graydark.png
		map textures/temp_textures/metallist02_i.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 1
	}
}

metallist03
{
	{
		map textures/temp_textures/metallist01_d.png
		map textures/temp_textures/metallist01_n.png
		map textures/graydark.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.5
	}
}

metallist04
{
	{
		map textures/temp_textures/metallist02_d.png
		map textures/temp_textures/metallist02_n.png
		map textures/graydark.png
		map textures/temp_textures/metallist02_i.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.5
	}
}

heatmetal_plate02
{
	{
		map textures/temp_textures/heatmetal_plate02_d.png
		map textures/temp_textures/heatmetal_plate02_n.png
		map textures/temp_textures/heatmetal_plate02_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.125
	}
}

heatmetal_plate01
{
	{

		map textures/temp_textures/heatmetal_plate01_d.png
		map textures/flat_normal.png
		map textures/temp_textures/heatmetal_plate01_s.png
		map textures/temp_textures/heat_noise_c.png
		map textures/flat_normal.png
		map textures/temp_textures/dirt_s.png
		map textures/temp_textures/noise_test2.png
		material_id 40
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tileblend2db.ps.cso
		pixel_shader_param float_params 0.25
        uv_scale 0.5
		vertex_shader_param inverse
		vertex_shader_param camera
 }
}

metalwall_heat

{
 {
		map textures/temp_textures/metalwall_heat_d.png
		map textures/temp_textures/metalwall01_n.png
		map textures/temp_textures/metalwall_heat_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.25
 }
}


inc_floor

{
 {
		map textures/temp_textures/inc_floor_d.png
		map textures/temp_textures/inc_floor_n.png
		map textures/graydark.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.25
 }
}


floortile

{
 {
		map textures/temp_textures/floortile_d.png
		map textures/temp_textures/floortile_n.png
		map textures/temp_textures/floortile_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale .75
}
}
stripe_1

{
	{
		map textures/temp_textures/stripe_1.png
		map textures/temp_textures/stripe_1_n.png
		map textures/black.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.125
	}
}

stripe_1_s

{
	{
		map textures/temp_textures/stripe_1.png
		map textures/temp_textures/stripe_1_n.png
		map textures/black.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.25
	}
}

stripe_2

{
	{
		map textures/temp_textures/stripe_2.png
		map textures/temp_textures/stripe_2_n.png
		map textures/black.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.125
	}
}