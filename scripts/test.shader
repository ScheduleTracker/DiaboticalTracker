testtrans
{
	{
		map textures/red.png
		map textures/uv.png
		vertex_shader statictrans_col.vs.cso 111 NGCT
		vertex_shader_param inverse
		vertex_shader_param camera
		vertex_shader_param look_and_time
		pixel_shader statictranstex.ps.cso
		pixel_shader_param float_params 0 0.2 0.3
		blendfunc blend
	}
}

parallax
{
	{
		map textures/test/rock_d.png
		map textures/test/rock_n.png
		map textures/gray.png
		map textures/black.png
		map textures/test/rock_h.png
		vertex_shader tilepara.vs.cso 111 NGT
		pixel_shader tilepara.ps.cso
		pixel_shader_param camera
	}
}
