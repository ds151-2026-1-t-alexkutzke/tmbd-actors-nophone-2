import { useLocalSearchParams, Link } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView, Pressable } from 'react-native';
import { api } from '../../src/api/tmdb';

interface Actor {
    name: string;
    biography: string;
    profile_path: string;
}

export default function ActorDetailsScreen() {
    const { id } = useLocalSearchParams();
    const [actor, setActor] = useState<Actor | null>(null);
    const [movies, setMovies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
              const [actorRes, moviesRes] = await Promise.all([api.get(`/person/${id}`),api.get(`/person/${id}/movie_credits`)]);
              setActor(actorRes.data);
              setMovies(moviesRes.data.cast);
            } catch (error) {
                console.error('Error fetching actor:', error);
            } finally {
                setLoading(false);
            }
            
        };

        if (id) fetchData();
    }, [id]);

    if (loading) {
        return (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#E50914" />
          </View>
        );
      }
      if (!actor) {
          return (
            <View style={styles.center}>
              <Text style={styles.errorText}>ator não encontrado.</Text>
            </View>
          );
        }

    return (
        <ScrollView style={styles.container}>
          {actor.profile_path && (
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/w500${actor.profile_path}` }}
              style={styles.poster}
              resizeMode="cover"
            />
          )}
          <View style={styles.content}>
            <Text style={styles.title}>{actor.name}</Text>
    
            <Text style={styles.sectionTitle}>Sinopse</Text>
            <Text style={styles.overview}>
              {actor.biography || 'Bibliografia não disponível para este ator.'}
            </Text>
            <Text style={styles.sectionTitle}>Filmografia</Text>
          </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {movies.map((movie) => (<Link key={movie.id} href={`/movie/${movie.id}`} asChild>
                <Pressable style={{ marginRight: 12 }}> {movie.poster_path ? (
                  <Image
                    source={{ uri: `https://image.tmdb.org/t/p/w200${movie.poster_path}` }}
                    style={{ width: 100, height: 150, borderRadius: 8 }}
                  />
              ) : (
                <View style={{
                  width: 100,
                  height: 150,
                  backgroundColor: '#333',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Text style={{ color: '#999' }}>Sem imagem</Text>
                </View>
              )}
                  </Pressable>
                </Link>
              ))}
            </ScrollView>
        </ScrollView>
        
      );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  poster: { width: '100%', height: 400 },
  content: { padding: 20 },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  statsContainer: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  statText: { color: '#E50914', fontSize: 16, fontWeight: '600' },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  overview: { color: '#D1D5DB', fontSize: 16, lineHeight: 24 },
  errorText: { color: '#FFFFFF', fontSize: 18 },
});