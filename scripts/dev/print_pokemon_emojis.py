def print_pokemon_emojis(start, end):
    """Prints emojis in format \:pokemon_id: for all pokemon in range start-end"""
    all_emojis = []
    for pokemon_id in range(start, end + 1):
        emoji_string = f"\\:{pokemon_id:03}:"
        all_emojis.append(emoji_string)

    print(" ".join(all_emojis))

if __name__ == "__main__":
    start = int(input("Enter the start pokemon id: "))
    end = int(input("Enter the end pokemon id: "))
    print_pokemon_emojis(start, end)
    