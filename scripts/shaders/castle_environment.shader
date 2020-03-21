castle_dirt01
{
 {
  map textures/environment/castle/dirt01_d.png
  map textures/flat_normal.png
  map textures/black.png

  //material_id 40
  vertex_shader tile.vs.cso 111 NGT
  pixel_shader tile.ps.cso
  pixel_shader_param float_params 0.5 0.5
       uv_scale 0.25
  vertex_shader_param inverse
  vertex_shader_param camera
 }
}

castle_grass01
{
	{
	map	textures/environment/castle/grass01_d.png
	map	textures/flat_normal.png
	ma	textures/environment/castle/grass01_d.png

	vertex_shader		tile.vs.cso 111 NGT
	pixel_shader		tile.ps.cso
	pixel_shader_param	float_params 0.5 0.5
        uv_scale		0.125
	vertex_shader_param	inverse
	vertex_shader_param	camera
	}
}

castle_grass01_dirt01
{
 {

	map	textures/environment/castle/grass01_d.png
	map	textures/flat_normal.png
	map	textures/environment/castle/grass01_d.png
  	map	textures/environment/castle/dirt01_d.png
  	map	textures/flat_normal.png
  	map	textures/black.png
	map	textures/environment/castle/grass01_mask.png

	vertex_shader		tile.vs.cso 111 NGT
	pixel_shader		tileblend2dc.ps.cso
	pixel_shader_param	float_params 1 .125
    	uv_scale		0.125
	vertex_shader_param	inverse
	vertex_shader_param	camera
 }
}

castle_gravel01
{
	{
	map	textures/environment/castle/gravel01_d.png
	map	textures/environment/castle/gravel01_n.png
	map	textures/environment/castle/gravel01_d.png

	vertex_shader		tile.vs.cso 111 NGT
	pixel_shader		tile.ps.cso
	pixel_shader_param	float_params 0.5 0.5
        uv_scale		0.25
	vertex_shader_param	inverse
	vertex_shader_param	camera
	}
}

castle_plaster01_beige
{
	{
	map textures/environment/castle/plaster01_beige_d.png
	map textures/environment/castle/plaster01_n.png
	map textures/black.png

	vertex_shader		tile.vs.cso 111 NGT
	pixel_shader		tile.ps.cso
	pixel_shader_param	float_params 0.5 0.5
        uv_scale		0.25
	vertex_shader_param	inverse
	vertex_shader_param	camera
	}
}

castle_plaster01_grey
{
	{
	map	textures/environment/castle/plaster01_grey_d.png
	map	textures/environment/castle/plaster01_n.png
	map	textures/black.png

	vertex_shader		tile.vs.cso 111 NGT
	pixel_shader		tile.ps.cso
	pixel_shader_param	float_params 0.5 0.5
        uv_scale		0.25
	vertex_shader_param	inverse
	vertex_shader_param	camera
	}
}

castle_plasterwindow01_beige
{
	{
	map	textures/environment/castle/plasterwindow01_beige_d.png
	map	textures/flat_normal.png
	map	textures/black.png

	vertex_shader		tile.vs.cso 111 NGT
	pixel_shader		tile.ps.cso
	pixel_shader_param	float_params 0.5 0.5
        uv_scale		0.25
	vertex_shader_param	inverse
	vertex_shader_param	camera
	}
}

castle_plasterwindow01_grey
{
	{
	map	textures/environment/castle/plasterwindow01_grey_d.png
	map	textures/flat_normal.png
	map	textures/black.png

	vertex_shader		tile.vs.cso 111 NGT
	pixel_shader		tile.ps.cso
	pixel_shader_param	float_params 0.5 0.5
        uv_scale		0.25
	vertex_shader_param	inverse
	vertex_shader_param	camera
	}
}

castle_stonefloor01
{
 {
	map	textures/environment/castle/stonefloor01_d.png
	map	textures/environment/castle/stonefloor01_n.png
	map	textures/environment/castle/stonefloor01_s.png

	vertex_shader		tile.vs.cso 111 NGT
	pixel_shader		tile.ps.cso
	pixel_shader_param	float_params 0.5 0.5
        uv_scale 		0.25
	vertex_shader_param	inverse
	vertex_shader_param	camera
 }
}

castle_stonefloor01_dirt01
{
	{
	map	textures/environment/castle/stonefloor01_d.png
	map	textures/environment/castle/stonefloor01_n.png
	map	textures/black.png
	map	textures/environment/castle/dirt01_d.png
	map	textures/flat_normal.png
	map	textures/black.png
	map	textures/temp_textures/temple/blend_mask2.png

	vertex_shader		tile.vs.cso 111 NGT
	pixel_shader		tileblend2dc.ps.cso
	pixel_shader_param	float_params 0.5 0.5
        uv_scale		0.25
	vertex_shader_param	inverse
	vertex_shader_param	camera
	}
}

castle_stonefloor01_grass01
{
	{
	map	textures/environment/castle/stonefloor01_d.png
	map	textures/environment/castle/stonefloor01_n.png
	map	textures/black.png
	map	textures/environment/castle/grass01_d.png
	map	textures/flat_normal.png
	map	textures/black.png
	map	textures/temp_textures/temple/blend_mask2.png

	vertex_shader		tile.vs.cso 111 NGT
	pixel_shader		tileblend2dc.ps.cso
	pixel_shader_param	float_params 0.5 0.5
        uv_scale		0.25
	vertex_shader_param	inverse
	vertex_shader_param	camera
	}
}

castle_stonefloor01_plaster01_grey
{
	{
	map	textures/environment/castle/stonefloor01_d.png
	map	textures/environment/castle/stonefloor01_n.png
	map	textures/black.png
	map	textures/environment/castle/plaster01_grey_d.png
	map	textures/flat_normal.png
	map	textures/black.png
	map	textures/temp_textures/temple/blend_mask2.png

	vertex_shader		tile.vs.cso 111 NGT
	pixel_shader		tileblend2dc.ps.cso
	pixel_shader_param	float_params 0.5 0.5
        uv_scale		0.25
	vertex_shader_param	inverse
	vertex_shader_param	camera
	}
}

castle_stonewall01
{
	{
	map	textures/environment/castle/stonewall01_d.png
	map	textures/environment/castle/stonewall01_n.png
	map	textures/black.png

	vertex_shader		tile.vs.cso 111 NGT
	pixel_shader		tile.ps.cso
	pixel_shader_param	float_params 0.5 0.5
        uv_scale		0.25
	vertex_shader_param	inverse
	vertex_shader_param	camera
	}
}

castle_stonewall01_plaster01_beige
{
	{
	map	textures/environment/castle/stonewall01_d.png
	map	textures/environment/castle/stonewall01_n.png
	map	textures/black.png
  	map	textures/environment/castle/plaster01_beige_d.png
  	map	textures/environment/castle/plaster01_n.png
  	map	textures/black.png
	map	textures/environment/castle/stonewall01_mask.png

	vertex_shader		tile.vs.cso 111 NGT
	pixel_shader		tileblend2dc.ps.cso
	pixel_shader_param	float_params 1 .5
    	uv_scale 0.25
	vertex_shader_param	inverse
	vertex_shader_param	camera
	}
}

castle_stonewall01_plaster01_grey
{
	{
	map	textures/environment/castle/stonewall01_d.png
	map	textures/environment/castle/stonewall01_n.png
	map	textures/black.png
  	map	textures/environment/castle/plaster01_grey_d.png
  	map	textures/environment/castle/plaster01_n.png
  	map	textures/black.png
	map	textures/environment/castle/stonewall01_mask.png

	vertex_shader		tile.vs.cso 111 NGT
	pixel_shader		tileblend2dc.ps.cso
	pixel_shader_param	float_params 1 .5
    	uv_scale		0.25
	vertex_shader_param	inverse
	vertex_shader_param	camera
	}
}

castle_stonewall01_mossy
{
	{
	map	textures/environment/castle/stonewall01_mossy_d.png
	map	textures/environment/castle/stonewall01_n.png
	map	textures/black.png

	vertex_shader		tile.vs.cso 111 NGT
	pixel_shader		tile.ps.cso
	pixel_shader_param	float_params 0.5 0.5
        uv_scale		0.25
	vertex_shader_param	inverse
	vertex_shader_param	camera
	}
}

castle_stonewall01_moss01
{
	{
	map	textures/environment/castle/stonewall01_d.png
	map	textures/environment/castle/stonewall01_n.png
	map	textures/black.png
  	map	textures/environment/castle/moss01_d.png
  	map	textures/environment/castle/stonewall01_n.png
  	map	textures/black.png
	map	textures/environment/castle/stonewall01_moss01_mask.png

	vertex_shader		tile.vs.cso 111 NGT
	pixel_shader		tileblend2dc.ps.cso
	pixel_shader_param	float_params 1 2
    	uv_scale		0.25
	vertex_shader_param	inverse
	vertex_shader_param	camera
	}
}


castle_stonewall02
{
	{
	map	textures/environment/castle/stonewall02_d.png
	map	textures/environment/castle/stonewall02_n.png
	map 	textures/black.png

	vertex_shader		tile.vs.cso 111 NGT
	pixel_shader		tile.ps.cso
	pixel_shader_param	float_params 0.5 0.5
        uv_scale		0.125
	vertex_shader_param	inverse
	vertex_shader_param	camera
	}
}