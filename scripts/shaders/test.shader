//gray - shiney
//black  - mat

material_test_1
{
	{
		map textures/test/test_1.png
		map textures/flat_normal.png
		map textures/black.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.25
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}

material_test_2
{
	{
		map textures/test/test_2.png
		map textures/flat_normal.png
		map textures/black.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.25
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}

material_test_3
{
	{
		map textures/test/test_3.png
		map textures/flat_normal.png
		map textures/black.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.25
		vertex_shader_param inverse
		vertex_shader_param camera
	}
}

props/temple/prison_bot_wall_mat_uvset1
{
	{
		map textures/character/eggbot_uvset1_skull_d.png
		map textures/character/eggbot_uvset1_n.png
		map textures/gray75.png
		map textures/black.png
		material_id 40
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera

		pixel_shader tile.ps.cso
	}
}


props/temple/prison_bot_wall_mat_uvset2
{
	{
		map textures/character/eggbot_uvset2_d.png
		map textures/character/eggbot_uvset2_n.png
		map textures/gray75.png
		map textures/black.png
		material_id 40
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera

		pixel_shader tile.ps.cso
	}
}


props/temple/prison_bot_wall_mat_uvset3
{
	{
		map textures/character/eggbot_uvset3_skull_d.png
		map textures/character/eggbot_uvset3_n.png
		map textures/gray75.png
		map textures/black.png
		material_id 40
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera

		pixel_shader tile.ps.cso
	}
}

props/temple/prison_bot_wall_mat_uvset4
{
	{
		map textures/character/eggbot_uvset4_skull_d.png
		map textures/character/eggbot_uvset4_n.png
		map textures/gray75.png
		map textures/black.png
		material_id 40s
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera

		pixel_shader tile.ps.cso
	}
}