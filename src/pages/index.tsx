import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';
import Link from 'next/link';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { format } from 'date-fns';
import { useState } from 'react';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({
  postsPagination: { results, next_page },
}: HomeProps) {
  const [page, setPage] = useState<PostPagination>({ results, next_page });

  return (
    <>
      <main className={styles.container}>
        <Header />
        <div className={styles.posts}>
          {page.results.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a href="">
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>
                <div className={styles.timeAuthor}>
                  <time>
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy'
                    ).toLocaleLowerCase()}
                  </time>
                  <span className={styles.author}>{post.data.author}</span>
                </div>
              </a>
            </Link>
          ))}
          {page.next_page && (
            <button
              className={styles.morePosts}
              onClick={() => {
                fetch(next_page)
                  .then(response => response.json())
                  .then(postPagination => {
                    setPage({
                      next_page: postPagination.next_page,
                      results: [...page.results, ...postPagination.results],
                    });
                  });
              }}
            >
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.author', 'posts.subtitle'],
      pageSize: 25,
    }
  );

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        results,
        next_page: postsResponse.next_page,
      },
    },
  };
};
