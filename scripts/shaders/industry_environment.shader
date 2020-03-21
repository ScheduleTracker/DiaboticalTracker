// TODO

//grass_floor
{
	{
	map models/experiments/dirt.png
	map textures/flat_normal.png
	map textures/black.png
  
	map models/experiments/ter_grass_d.png
	map textures/flat_normal.png
	map textures/black.png

	map textures/environment/industry/grass_m.png
	material_id 40
	vertex_shader tile.vs.cso 111 NGT
	pixel_shader tileblend2dc.ps.cso
	pixel_shader_param float_params 0.5 0.5
        uv_scale 0.125
	vertex_shader_param inverse
	vertex_shader_param camera
	}
}

//metal_plates_prop
{
	{
		map textures/environment/industry/metalwall01_d.png
		map textures/flat_normal.png
		map textures/environment/industry/metalwallplates01_s.png
		material_id 40
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
	}
}


// CHECKED OFF

//CONCRETE

industry_concretefloor01
{
	{
		map textures/environment/industry/concretefloor01_d.png
		map textures/flat_normal.png
		map textures/black.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.125
	}
}

industry_concretewall01
{
	{
		map textures/environment/industry/concretewall01_d.png
		map textures/environment/industry/concretewall01_n.png
		map textures/environment/industry/concretewall01_s.png
		map textures/black.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.125
	}
}
industry_concretewall01_damaged
{
	{
		map textures/environment/industry/concretewall01_damaged_d.png
		map textures/environment/industry/concretewall01_damaged_n.png
		map textures/environment/industry/concretewall01_damaged_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.125
	}
}



//METAL
industry_corrugatedmetal01
{
	{
		map textures/environment/industry/corrugatedmetal01_d.png
		map textures/environment/industry/corrugatedmetal01_n.png
		map textures/environment/industry/corrugatedmetal01_s.png
		map textures/metal.png
		map textures/environment/industry/corrugatedmetal01_c.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tilemask.ps.cso
		uv_scale 0.125
  		pixel_shader_param accent1 4b4b4f
	}
}

industry_corrugatedmetal01_blue
{
	{
		map textures/environment/industry/corrugatedmetal01_d.png
		map textures/environment/industry/corrugatedmetal01_n.png
		map textures/environment/industry/corrugatedmetal01_s.png
		map textures/metal.png
		map textures/environment/industry/corrugatedmetal01_c.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tilemask.ps.cso
		uv_scale 0.125
  		pixel_shader_param accent1 2b82c8
	}
}

industry_corrugatedmetal01_red
{
 	{
		map textures/environment/industry/corrugatedmetal01_d.png
		map textures/environment/industry/corrugatedmetal01_n.png
		map textures/environment/industry/corrugatedmetal01_s.png
		map textures/metal.png
		map textures/environment/industry/corrugatedmetal01_c.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tilemask.ps.cso
		uv_scale 0.125
  		pixel_shader_param accent1 c25e15
	}
}

industry_corrugatedmetal01_yellow
{
	{
		map textures/environment/industry/corrugatedmetal01_d.png
		map textures/environment/industry/corrugatedmetal01_n.png
		map textures/environment/industry/corrugatedmetal01_s.png
		map textures/metal.png
		map textures/environment/industry/corrugatedmetal01_c.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tilemask.ps.cso
		uv_scale 0.125
  		pixel_shader_param accent1 e6a424
	}
}

industry_corrugatedmetal01_green
{
	{
		map textures/environment/industry/corrugatedmetal01_d.png
		map textures/environment/industry/corrugatedmetal01_n.png
		map textures/environment/industry/corrugatedmetal01_s.png
		map textures/metal.png
		map textures/environment/industry/corrugatedmetal01_c.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tilemask.ps.cso
		uv_scale 0.125
  		pixel_shader_param accent1 5ba42e
	}
}

industry_metalcrossbar01_blue
{
	{
		map textures/environment/industry/metalcrossbar01_d.png
		map textures/environment/industry/metalcrossbar01_n.png
		map textures/environment/industry/metalcrossbar01_s.png
		map textures/metal.png
		map textures/environment/industry/metalcrossbar01_c.png

		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tilemask.ps.cso
		uv_scale 0.125
  		pixel_shader_param accent1 2b82c8
	}
}

industry_metalcrossbar01_red
{
	{
		map textures/environment/industry/metalcrossbar01_d.png
		map textures/environment/industry/metalcrossbar01_n.png
		map textures/environment/industry/metalcrossbar01_s.png
		map textures/metal.png
		map textures/environment/industry/metalcrossbar01_c.png

		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tilemask.ps.cso
		uv_scale 0.125
  		pixel_shader_param accent1 c25e15
	}
}

industry_metalcrossbar01_yellow
{
	{
		map textures/environment/industry/metalcrossbar01_d.png
		map textures/environment/industry/metalcrossbar01_n.png
		map textures/environment/industry/metalcrossbar01_s.png
		map textures/metal.png
		map textures/environment/industry/metalcrossbar01_c.png

		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tilemask.ps.cso
		uv_scale 0.125
  		pixel_shader_param accent1 ecc81f
	}
}

industry_metalcrossbar01_green
{
	{
		map textures/environment/industry/metalcrossbar01_d.png
		map textures/environment/industry/metalcrossbar01_n.png
		map textures/environment/industry/metalcrossbar01_s.png
		map textures/metal.png
		map textures/environment/industry/metalcrossbar01_c.png

		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tilemask.ps.cso
		uv_scale 0.125
  		pixel_shader_param accent1 5ba42e
	}
}

industry_metalcrossbar01_gray
{
	{
		map textures/environment/industry/metalcrossbar01_d.png
		map textures/environment/industry/metalcrossbar01_n.png
		map textures/environment/industry/metalcrossbar01_s.png
		map textures/metal.png
		map textures/environment/industry/metalcrossbar01_c.png

		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tilemask.ps.cso
		uv_scale 0.125
  		pixel_shader_param accent1 4a4b50
	}
}

industry_metalplates_inbevelled_rust
{
	{
		map textures/environment/industry/metalplates_inbevelled_rust_d.png
		map textures/environment/industry/metalplates_inbevelled_n.png
		map textures/black.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.5
	}
}

industry_metalplates01_blue
{
	{
		map textures/environment/industry/metalplates01_d.png
		map textures/environment/industry/metalplates01_n.png
		map textures/environment/industry/metalplates01_s.png
		map textures/metal.png
		map textures/environment/industry/metalplates01_c.png

		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tilemask.ps.cso
		uv_scale 0.125
  		pixel_shader_param accent1 2b82c8
	}
}

industry_metalplates01_red
{
	{
		map textures/environment/industry/metalplates01_d.png
		map textures/environment/industry/metalplates01_n.png
		map textures/environment/industry/metalplates01_s.png
		map textures/metal.png
		map textures/environment/industry/metalplates01_c.png

		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tilemask.ps.cso
		uv_scale 0.125
  		pixel_shader_param accent1 c25e15
	}
}

industry_metalplates01_yellow
{
	{
		map textures/environment/industry/metalplates01_d.png
		map textures/environment/industry/metalplates01_n.png
		map textures/environment/industry/metalplates01_s.png
		map textures/metal.png
		map textures/environment/industry/metalplates01_c.png

		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tilemask.ps.cso
		uv_scale 0.125
  		pixel_shader_param accent1 e6a424
	}
}

industry_metalplates01_green
{
	{
		map textures/environment/industry/metalplates01_d.png
		map textures/environment/industry/metalplates01_n.png
		map textures/environment/industry/metalplates01_s.png
		map textures/metal.png
		map textures/environment/industry/metalplates01_c.png

		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tilemask.ps.cso
		uv_scale 0.125
  		pixel_shader_param accent1 5ba42e
	}
}

industry_metalplates03_large
{
	{
		map textures/environment/industry/metalplates03_d.png
		map textures/environment/industry/metalplates03_n.png
		map textures/environment/industry/metalplates03_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.0625
	}
}

industry_metalplates03
{
	{
		map textures/environment/industry/metalplates03_d.png
		map textures/environment/industry/metalplates03_n.png
		map textures/environment/industry/metalplates03_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.125
	}
}

industry_metalplates03_grass
{
	{
	map textures/environment/industry/metalplates03_d.png
	map textures/environment/industry/metalplates03_n.png
	map textures/environment/industry/metalplates03_s.png

  	map models/experiments/dirt.png
	map textures/flat_normal.png
	map textures/black.png

	map textures/environment/industry/noise_plates_dirt.png
	material_id 40
	vertex_shader tile.vs.cso 111 NGT
	pixel_shader tileblend2dc.ps.cso
	pixel_shader_param float_params 1
        uv_scale 0.125
	vertex_shader_param inverse
	vertex_shader_param camera
	}
}

industry_metaltrim01
{
	{
		map textures/environment/industry/metaltrim01_d.png
		map textures/environment/industry/metaltrim01_n.png
		map textures/environment/industry/metaltrim01_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.125
	}
}

industry_metalwall01
{
	{
		map textures/environment/industry/metalwall01_d.png
		map textures/environment/industry/metalwall01_n.png
		map textures/environment/industry/metalwall01_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.125
	}
}

industry_metalwall02_red
{
	{
		map textures/environment/industry/metalwall02_d.png
		map textures/environment/industry/metalwall03_n.png
		map textures/environment/industry/metalwall03_s.png
		map textures/metal.png
		map textures/environment/industry/metalwall02_c.png

		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tilemask.ps.cso
		uv_scale 0.125
  		pixel_shader_param accent1 c25e15
	}
}

industry_metalwall02_yellow
{
	{
		map textures/environment/industry/metalwall02_d.png
		map textures/environment/industry/metalwall03_n.png
		map textures/environment/industry/metalwall03_s.png
		map textures/metal.png
		map textures/environment/industry/metalwall02_c.png

		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tilemask.ps.cso
		uv_scale 0.125
  		pixel_shader_param accent1 e6a424
	}
}

industry_metalwall02_blue
{
	{
		map textures/environment/industry/metalwall02_d.png
		map textures/environment/industry/metalwall03_n.png
		map textures/environment/industry/metalwall03_s.png
		map textures/metal.png
		map textures/environment/industry/metalwall02_c.png

		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tilemask.ps.cso
		uv_scale 0.125
  		pixel_shader_param accent1 2b82c8
	}
}

industry_metalwall02_green
{
	{
		map textures/environment/industry/metalwall02_d.png
		map textures/environment/industry/metalwall03_n.png
		map textures/environment/industry/metalwall03_s.png
		map textures/metal.png
		map textures/environment/industry/metalwall02_c.png

		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tilemask.ps.cso
		uv_scale 0.125
  		pixel_shader_param accent1 5ba42e
	}
}

industry_metalwall03
{
	{
		map textures/environment/industry/metalwall03_d.png
		map textures/environment/industry/metalwall03_n.png
		map textures/environment/industry/metalwall03_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.125
	}
}

industry_metalwall03_large
{
	{
		map textures/environment/industry/metalwall03_d.png
		map textures/environment/industry/metalwall03_n.png
		map textures/environment/industry/metalwall03_s.png
		map textures/metal.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso
		uv_scale 0.0625
	}
}
