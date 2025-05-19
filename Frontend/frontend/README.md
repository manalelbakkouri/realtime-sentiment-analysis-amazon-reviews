
# Sentiment Analysis Dashboard

An elegant, professional, and interactive dashboard for real-time sentiment analysis monitoring and offline data exploration.

## Features

### Real-time Monitoring Dashboard
- Live sentiment tracking with automatic updates
- Color-coded sentiment visualization (🟢 Positive, 🟡 Neutral, 🔴 Negative)
- Dynamic statistics with sentiment distribution
- Manual review analysis tool
- Responsive design for all device sizes

### Offline Analysis Dashboard
- Advanced data visualization with interactive charts
- Filter controls for data exploration
- Product-specific analysis tools
- Trend analysis over time
- Comparative sentiment analysis

## Technologies Used

- **Frontend**: React (Vite), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Data Visualization**: Recharts
- **State Management**: React Query
- **Data Fetching**: Custom API integration

## Development

This project was created using Lovable, a platform for rapid application development.

To run the project locally:

```sh
# Install dependencies
npm install

# Start the development server
npm run dev
```

## Backend Integration

This dashboard is designed to connect with a Flask backend that processes sentiment analysis through a machine learning pipeline. The backend stack includes:

- Flask API
- MongoDB for data storage
- Machine Learning pipeline (scikit-learn)
- Kafka for real-time data streaming
- Spark Streaming for data processing

## Project Architecture

```
src/
├── components/        # UI components
│   ├── charts/       # Data visualization components
│   └── ...           # Other UI components
├── hooks/            # Custom React hooks
├── pages/            # Application pages
├── services/         # API services
└── ...
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
