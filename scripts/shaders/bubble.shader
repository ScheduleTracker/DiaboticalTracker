core_bubble
{
  {
    map models/eggbot/shield/hexagon_grid_3.png
    map !depth
    vertex_shader bubble.vs.cso 111 NGT
    vertex_shader_param inverse
    vertex_shader_param camera
    vertex_shader_param look_and_time
    pixel_shader bubble.ps.cso
	pixel_shader_param accent1 0.2 0.75 0.95 0.7
	pixel_shader_param accent2 0.05 0.15 0.2 0.5
	pixel_shader_param accent3 0.07 0.27 0.3 0.5
    blendfunc blend
    //depth read_only
    //culling back
  }
}

core_primitive_sphere
{
  {
    map textures/white.png
    map !depth
    vertex_shader bubble.vs.cso 111 NGT
    vertex_shader_param inverse
    vertex_shader_param camera
    vertex_shader_param look_and_time
    pixel_shader bubble.ps.cso
	//Border color
	pixel_shader_param accent1 0.4 0.9 0.75 0.8
	//Dark base color
	pixel_shader_param accent2 0.05 0.15 0.07 0.4
	//Light base color
	pixel_shader_param accent3  0 0 0 0
    blendfunc blend
    //depth read_only
    //culling back
  }
}


core_primitive_sphere_smoke
{
  {
    map textures/noise.dds
    map !depth
    vertex_shader bubblesm.vs.cso 111 NGT
    vertex_shader_param inverse
    vertex_shader_param camera
    vertex_shader_param look_and_time
    pixel_shader bubblesm.ps.cso
	//Border color
	pixel_shader_param accent1 0.4 0.9 0.75 0.8
	//Dark base color
	pixel_shader_param accent2 0.05 0.15 0.07 0.4
    //Light base color
    pixel_shader_param accent3  0 0 0 0
    blendfunc blend
    //depth read_only
    //culling back
    //ambient_occlusion false
  }
}

core_primitive_sphere_smoke_opaque
{
  {
		map textures/gray35.png
		map textures/flat_normal.png
		map textures/black.png
		map textures/black.png
		material_id 91
		vertex_shader tilestatic_col.vs.cso 111 NGCT
		vertex_shader_param inverse
		vertex_shader_param camera
		pixel_shader tile.ps.cso
		culling off
	}
}
