SELECT
	p.name,
	v.tag,
	pj.name as project_name, 
	d.name as document_name,
	d.extension,
	d.content
FROM platform p
JOIN version v ON v.platform = p.name
LEFT OUTER JOIN project pj ON p.name = pj.platform AND v.tag = pj.tag
LEFT OUTER JOIN document d ON pj.name = d.project;
