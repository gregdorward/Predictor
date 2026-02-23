const ShareShortlistButton = ({ selectedFixtures }) => {
  
  const createShareLink = () => {
    const selectedFixtureIds = selectedFixtures.map(fixture => fixture.id);
    const fixtureIdsString = selectedFixtureIds.join(',');

    const baseUrl = window.location.origin + window.location.pathname;
    
    // Construct the final share link
    const link = `${baseUrl}?shortlist=${fixtureIdsString}&view=shortlist`;
    
    return link;
  };

  const handleShare = async () => {
    const link = createShareLink();
    const shareData = {
      title: 'My shortlist',
      text: 'Here is my shortlist of matches from Soccer Stats Hub:',
      url: link,
    };

    // 1. Check for Web Share API (Best option for mobile/native sharing)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        // Optional: Add a success notification here
      } catch (err) {
        // User cancelled share or an error occurred (e.g., sharing a file)
        console.error('Web Share failed or was cancelled:', err);
      }
    } else {
      // 2. Fallback: Copy to Clipboard (Best option for desktop or unsupported browsers)
      try {
        await navigator.clipboard.writeText(link);
        alert('Link copied to clipboard! You can now paste it into WhatsApp, Telegram, etc.');
      } catch (err) {
        console.error('Failed to copy link:', err);
        // Final fallback: show the link directly
        prompt('Copy this link:', link); 
      }
    }
  };

  return (
    <button onClick={handleShare} className="ShareButton">
      🔗
    </button>
  );
};

export default ShareShortlistButton;