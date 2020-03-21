//Material IDS:
//0 = default
//102 = overbright
//103 = 3rd map is glow map

//SHADER FILE FOR CITYY'S DEV TEXTURES
//V1 - 161007

//============= 01 FLOORS

f_01
{
	{
		map textures/ct_dev/f_01.png 				
		map textures/flat_normal.png			
		map textures/graydark.png						
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso		

	}
}

//============= 02 WALLS

w_01
{
	{
		map textures/ct_dev/w_01.png
		map textures/flat_normal.png
		map textures/graydark.png
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso		

	}
}

//============= 03 CEILLINGS

c_01
{
	{
		map textures/ct_dev/c_01.png
		map textures/flat_normal.png
		map textures/graydark.png
		vertex_shader tile.vs.cso 111 NGT
		//vertex_shader_param camera
		pixel_shader tile.ps.cso		

	}
}