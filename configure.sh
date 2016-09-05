#!/bin/bash
# Configure eval project and create project user
# eval_shared project must exist in /sources/eval_shared
# ARGS: username, psql_password
touch /home/$1/.psql_history >/dev/null 2>&1

content=`sed "s/\\$1/$1/g" /sources/eval_shared/queries/init_user.sql`

su postgres << EOF
    cd ~/
    createuser -DRS $1
    createdb -O $1 -T template1 $1
    psql -c "ALTER USER $1 WITH PASSWORD '$2';"
    psql -f /sources/eval_shared/queries/init.sql
    echo "$content" | psql -d eval
EOF

cd ~/
mkdir "/home/$1/bash"
wget -O "/home/$1/bash/git-prompt.sh" https://gist.githubusercontent.com/ALJCepeda/d90844bf63e23a06d3d3/raw/d1975442c357c0351990ed6a7de70b8259a0f40d/gistfile1.sh
wget -O "/home/$1/.bashrc" https://gist.githubusercontent.com/ALJCepeda/dc006ba37c7befec4f42/raw/480f86b33575ba680cf4e773d7b48d6acafb80ae/gistfile1.sh
su << EOF
    echo "export PSQL_EVAL=postgres://$1:$2@localhost/eval" >> /home/$1/.bashrc
EOF
chown -R "$1:root" "/home/$1/"

echo '<VirtualHost *:80>
	ProxyPreserveHost On
	ProxyPass / http://localhost:8002/
	ProxyPassReverse / http://localhost:8002/
	ServerName eval.aljcepeda.com
</VirtualHost>
<VirtualHost *:80>
	ProxyPreserveHost On
	ProxyPass / http://localhost:8002/
	ProxyPassReverse / http://localhost:8002/
	ServerName code.aljcepeda.com
</VirtualHost>' >> /etc/apache2/sites-available/eval.conf

echo 'Installed Eval project'
