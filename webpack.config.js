// webpack.config.js
import { webpackFallback } from '@txnlab/use-wallet' // exported by all packages

export default {
  // ... other webpack configuration
  resolve: {
    fallback: {
      ...webpackFallback
    }
  }
}