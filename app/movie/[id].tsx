import { useLocalSearchParams, Link } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Pressable
} from 'react-native';
import { api } from '../../src/api/tmdb';

interface MovieDetails {
  title: string;
  overview: string;
  poster_path: string | null;
  vote_average: number;
  runtime: number;
}

interface Actor {
  id: number;
  name: string;
  profile_path: string | null;
}

export default function MovieDetailsScreen() {
  const { id } = useLocalSearchParams();

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [actors, setActors] = useState<Actor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Buscar detalhes do filme
        const movieResponse = await api.get(`/movie/${id}`);
        setMovie(movieResponse.data);

        // Buscar atores (cast)
        const creditsResponse = await api.get(`/movie/${id}/credits`);
        setActors(creditsResponse.data.cast); // ✅ CORRETO
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const renderActorItem = ({ item }: { item: Actor }) => (
    <Link href={`/people/${item.id}`} asChild>
      <Pressable style={styles.card}>
        {item.profile_path ? (
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w500${item.profile_path}` }}
            style={styles.actorImage}
          />
        ) : (
          <View style={styles.posterPlaceholder}>
            <Text style={styles.placeholderText}>Sem imagem</Text>
          </View>
        )}

        <View style={styles.cardContent}>
          <Text style={styles.actorName}>{item.name}</Text>
        </View>
      </Pressable>
    </Link>
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  if (!movie) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Filme não encontrado.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={actors}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderActorItem}
      contentContainerStyle={{ paddingBottom: 20 }}
      ListHeaderComponent={
        <>
          {movie.poster_path && (
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
              style={styles.poster}
            />
          )}

          <View style={styles.content}>
            <Text style={styles.title}>{movie.title}</Text>

            <View style={styles.statsContainer}>
              <Text style={styles.statText}>
                ⭐ {movie.vote_average.toFixed(1)}/10
              </Text>
              <Text style={styles.statText}>
                ⏱️ {movie.runtime} min
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Sinopse</Text>
            <Text style={styles.overview}>
              {movie.overview || 'Sinopse não disponível.'}
            </Text>

            <Text style={styles.sectionTitle}>Elenco</Text>
          </View>
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  poster: {
    width: '100%',
    height: 400,
  },

  content: {
    padding: 20,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },

  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },

  statText: {
    color: '#E50914',
    fontSize: 16,
    fontWeight: '600',
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },

  overview: {
    color: '#D1D5DB',
    fontSize: 16,
    lineHeight: 24,
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#1F1F1F',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },

  actorImage: {
    width: 100,
    height: 150,
  },

  posterPlaceholder: {
    width: 100,
    height: 150,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },

  placeholderText: {
    color: '#9CA3AF',
    fontSize: 12,
  },

  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },

  actorName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  errorText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});