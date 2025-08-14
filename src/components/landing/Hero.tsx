import { useEffect, useState } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { SimpleHero } from './SimpleHero';
import { Link } from 'react-router-dom';

export function Hero() {
  return <SimpleHero />;
}