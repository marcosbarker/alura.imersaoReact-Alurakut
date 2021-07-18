import React from 'react';
import MainGrid from '../src/components/MainGrid';
import Box from '../src/components/Box';
import nookies from 'nookies';
import jsonwebtoken from 'jsonwebtoken';
import {
  AlurakutMenu,
  OrkutNostalgicIconSet,
  AlurakutProfileSidebarMenuDefault
} from '../src/lib/AluraKutCommons';

import { ProfileRelationsBoxWrapper } from '../src/components/ProfileRelations';

function ProfileSidebar(propriedades) {
  return (
    <Box as="aside">
      <img src={`https://github.com/${propriedades.githubUser}.png`} style={{ borderRadius: '8px' }} />
      <hr />
      <p>
        <a className="boxLink" href={'http://github.com/${propriedades.githubUser}'} >
          @{propriedades.githubUser}
        </a>
      </p>
      <hr />
      <AlurakutProfileSidebarMenuDefault />
    </Box>
  )
}

function ProfileRelationsBox(propriedades) {
  return (
    <ProfileRelationsBoxWrapper>
           <h2 className="smallTitle">
            {propriedades.title} ({propriedades.items.length})
          </h2>
         <ul>
         </ul>
    </ProfileRelationsBoxWrapper>      
  )
}

export default function Home(props) {
  const githubUserAleatorio = props.githubUser;

  const [comunidades, setComunidades] = React.useState([]);

 
  const pessoasFavoritas = [
    'peas',
    'omariosouto',
    'juunegreiros',
    'PedroHCAlmeida',
    'raiocodrigues',
    'FredericoStilpen',
    'M4G1Ck',
    'JpBade',
    'Volneineves',
  ]

const [seguidores, setSeguidores] = React.useState([]);

React.useEffect(function(){
  fetch('https://api.github.com/users/marcosbarker/followers')
  .then(function(respostaDoServidor){
      return(respostaDoServidor.json())
  })
  .then(function(respostaCompleta) {
    setSeguidores(respostaCompleta);
  })

  //dato cms (graphQl)
  fetch('https://graphql.datocms.com/', {
    method: 'POST',
    headers: {
      'Authorization': '0d8bb25863c04b6aa6761f71596269',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },

    body: JSON.stringify({ "query": `query {
      allCommunities {
        id
        title
        imageUrl
      }
    }`})
  })
  .then((response) => response.json()) //pega o retorno do response .json e ja retorna
  .then((respostaCompleta) => {
    const comunidadesVindasDodato = respostaCompleta.data.allCommunities;
  
    setComunidades(comunidadesVindasDodato)
    })
}, [])


  return (
    <>
      <AlurakutMenu />
      <MainGrid>
        <div className="profileArea" style={{ gridArea: 'profileArea' }}>
          <ProfileSidebar githubUser={githubUserAleatorio} />
        </div>
        <div className="welcomeArea" style={{ gridArea: 'welcomeArea' }}>
          <Box>
            <h1 className="title">
              Bem vindo(a)
            </h1>

            <OrkutNostalgicIconSet />

          </Box>
          <Box>
            <h2 className="subTitle">O que você deseja fazer?</h2>
            <form onSubmit={function handleCriaComunidade(e) {
              e.preventDefault();
              const dadosDoForm = new FormData(e.target);

              const comunidade ={
                title: dadosDoForm.get('title'),
                imageUrl: dadosDoForm.get('image'),
              }

              fetch('/api/comunidades', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(comunidade),
              })
              .then(async (response) => {
                const dados = await response.json();

              const comunidade = dados.registroCriado;  

              const comunidadesAtualizadas = [...comunidades, comunidade];
              setComunidades(comunidadesAtualizadas)
              })
            }} >
              <div>
                <input
                  placeholder="Qual vai ser o nome da sua comunidade?"
                  name="title"
                  aria-label="Qual vai ser o nome da sua comunidade?"
                  type-text="text"
                />
              </div>
              <div>
                <input
                  placeholder="Coloque uma URL para usarmos de capa"
                  name="image"
                  aria-label="Coloque uma URL para usarmos de capa"
                />
              </div>
              <button>
                Criar comunidade
              </button>
            </form>
          </Box>
        </div>
        <div className="profileRelationsArea" style={{ gridArea: 'profileRelationsArea' }}>

          <ProfileRelationsBox title="Seguidores" items={seguidores}/> 

          <ProfileRelationsBoxWrapper>
             <h2 className="smallTitle">
              Comunidades ({comunidades.length})
            </h2>
            <ul>
              {comunidades.map((itemAtual) => {
                return (
                  <li key={itemAtual.id}>
                    <a href={`/comunidades/${itemAtual.id}`} >
                      <img src={itemAtual.imageUrl} />
                      <span>{itemAtual.title}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
            </ProfileRelationsBoxWrapper>

            <ProfileRelationsBoxWrapper>
            <h2 className="smallTitle">
              Pessoas da comunidade ({pessoasFavoritas.length})
            </h2>
            <ul>
              {pessoasFavoritas.map((itemAtual) => {
                return (
                  <li key={itemAtual}>
                    <a href={`users/${itemAtual}`} >
                      <img src={`https://github.com/${itemAtual}.png`} />
                      <span>{itemAtual}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </ProfileRelationsBoxWrapper>
        </div>
      </MainGrid>
    </>
  )
}

export async function getServerSideProps(context) {
  const cookies = nookies.get(context)
  const token = cookies.USER_TOKEN;
  
  const { isAuthenticated } = await fetch('https://alurakut.vercel.app/api/auth', {
    headers: {
      Authorization: token
    }
  })
  .then((resposta) => resposta.json())
  
  if(!isAuthenticated) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      }
    }
  }
  
  const { githubUser } = jsonwebtoken.decode(token);
  return {
    props: {
      githubUser
    }, // will be passed to the page component as props
  }
}