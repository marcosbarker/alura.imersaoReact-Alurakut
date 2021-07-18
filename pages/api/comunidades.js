import { SiteClient } from 'datocms-client';

export default async function recebedorDeRequests(request, response){

  if(request.method === 'POST') {
    const TOKEN = '0dbcac6435a37b3f00b1b7d3d6b678';
    const client = new SiteClient(TOKEN);

    const registroCriado = await client.items.create({
      itemType: "975359", //id do model community do datocms
      ...request.body,
    })

    response.json({
      dados: 'dados',
      registroCriado: registroCriado,
    })

    return;
  }

  response.status(404).json({
    message: 'sem GET, apenas POST'
  })
}