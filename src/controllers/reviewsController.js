import Client from "../models/clientModel.js"
import Trip from '../models/tripModel.js'

//  add Review 
export const addReview = async (req, res) => {
  try {
    const { clientId } = req.params; 
    const { rating, comment } = req.body;
    const driverId = req.user.id; 

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    client.reviews.push({
      driver: driverId,
      rating,
      comment
    });

    await client.save();
    res.status(201).json({ message: 'Review added successfully', client });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


//  get Reviews 
export const getReviews = async (req, res) => {
  try {
    const { clientId } = req.params;

    const client = await Client.findById(clientId)
      .populate('reviews.driver', 'name fullName image');

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
// count avg ratting
    const avgRating =
      client.reviews.reduce((sum, review) => sum + review.rating, 0) /
      (client.reviews.length || 1);
      
// count reviews
    const totalReviews = client.reviews.length;

    res.status(200).json({
      clientId: client._id,
      clientName: client.name,
      avgRating: `${avgRating.toFixed(1)} / 5`,
      reviews: client.reviews,
      totalReviews: totalReviews

    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


export const getDriverReviews = async (req, res) => {
  try {
    const { driverId } = req.params;

    // Find all trips for this driver where a review exists
   const trips = await Trip.find({ driverId: driverId, rating: { $exists: true } })
  .populate('client', 'name')
  .sort({ createdAt: -1 });

    const reviews = trips.map(trip => ({
      clientName: trip.client.name,
      tripCode: trip.tripCode,
      rating: trip.rating,
      review: trip.review,
      date: trip.createdAt,
    }));

    // Calculate average rating
    const totalRatings = trips.reduce((sum, trip) => sum + trip.rating, 0);
    const avgRating = trips.length ? (totalRatings / trips.length).toFixed(1) : 0;

    res.status(200).json({ 
      totalReviews: reviews.length, 
      averageRating: `${avgRating}/5`,
      reviews 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching driver reviews', error: error.message });
  }
};
