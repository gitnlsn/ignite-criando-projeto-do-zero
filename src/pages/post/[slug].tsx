import { format } from 'date-fns';
import { GetStaticPaths, GetStaticProps } from 'next';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const wordsInArticle = post.data.content.reduce((bodyWords, section) => {
    return (
      bodyWords +
      section.heading.split(' ').length +
      section.body.reduce((wordsInParagraph, paragraphs) => {
        return wordsInParagraph + paragraphs.text.split(' ').length;
      }, 0)
    );
  }, 0);
  return (
    <>
      <Header />
      <main className={styles.container}>
        <article>
          <img src={post.data.banner.url} alt={post.data.title} />
          <h1>{post.data.title}</h1>
          <div className={styles.dateAuthorTime}>
            <time>
              {format(
                new Date(post.first_publication_date),
                'dd MMM yyyy'
              ).toLocaleLowerCase()}
            </time>
            <span className={styles.author}>{post.data.author}</span>
            <span className={styles.timeReading}>
              {Math.ceil(wordsInArticle / 200) + ' min'}
            </span>
          </div>
          {post.data.content.map(section => (
            <section>
              <h2>{section.heading}</h2>
              {section.body.map(paragraph => (
                <p>{paragraph.text}</p>
              ))}
            </section>
          ))}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query('posts');

  return {
    paths: posts.results.map(post => ({
      params: {
        slug: post.uid,
      },
    })),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const {
    params: { slug },
  } = context;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  return {
    props: { post: response },
  };
};
