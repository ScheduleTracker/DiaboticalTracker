eve_deferred_light
{
	{
		map RESERVE
		map RESERVE
		vertex_shader deflight.vs.cso 111 NGTT
		pixel_shader deflight.ps.cso		
	}
}

core_hologram
{
    {
	map textures/white.png
	vertex_shader statictrans.vs.cso 111 NGT
	vertex_shader_param inverse
	vertex_shader_param camera
	vertex_shader_param look_and_time
	pixel_shader statictransholo.ps.cso
        pixel_shader_param float_params 0 0 0
        blendfunc blend
    }
}

core_hologram_animated
{
    {
	map textures/white.png
	vertex_shader animtrans.vs.cso 111 NGTA
	vertex_shader_param inverse
	vertex_shader_param camera
	vertex_shader_param bones
	vertex_shader_param look_and_time
	pixel_shader statictransholo.ps.cso
        pixel_shader_param float_params 0 0 0
        blendfunc blend
    }
}


core_flash
{
    {
	map textures/white.png
	vertex_shader statictrans.vs.cso 111 NGT
	vertex_shader_param inverse
	vertex_shader_param camera
	vertex_shader_param look_and_time
	pixel_shader statictranstex.ps.cso
        pixel_shader_param float_params 0 0 0
        blendfunc blend
    }
}

core_flash_animated
{
    {
	map textures/white.png
	vertex_shader animtrans.vs.cso 111 NGTA
	vertex_shader_param inverse
	vertex_shader_param camera
	vertex_shader_param bones
	vertex_shader_param look_and_time
	pixel_shader statictranstex.ps.cso
        pixel_shader_param float_params 0 0 0
        blendfunc blend
    }
}

core_portal_decal
{
	{
		map textures/white.png
		map textures/core/portal_mask.png
		map textures/black.png
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tiledecalp.ps.cso
	}
}

core_bbox
{
	{
		map textures/green.png
		vertex_shader statictrans.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		vertex_shader_param look_and_time
		pixel_shader statictranstex.ps.cso
		pixel_shader_param float_params 0 0 0
		blendfunc blend
	}
}

core_bbox_hl
{
	{
		map textures/gray90.png
		vertex_shader statictrans.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		vertex_shader_param look_and_time
		pixel_shader statictranstex.ps.cso
		pixel_shader_param float_params 0 0 0
		blendfunc blend
	}
}
core_outline_exterior
{
	{
		map textures/green.png
		vertex_shader statictransol.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader statictranstex.ps.cso
		blendfunc blend
	}
}
core_outline_exterior_hl
{
	{
		map textures/yellow.png
		vertex_shader statictransol.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader statictranstex.ps.cso
		blendfunc blend
	}
}

core_outline_interior
{
	{
		map textures/transparent.png
		vertex_shader statictrans.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader statictranstex.ps.cso
		blendfunc blend
	}
}

core_effects_decals
{
	{
		map textures/effectsfb.png
		map textures/flat_normal.png
		map textures/black.png
		vertex_shader tilestatic.vs.cso 111 NGT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tiledecal.ps.cso
	}
}

uvtest
{
	{
		map textures/uvtest.png
		map textures/flat_normal.png
		map textures/black.png
		vertex_shader tile.vs.cso 111 NGT
		pixel_shader tile.ps.cso	
	}
}