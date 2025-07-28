import java.io.*;
import java.math.BigInteger;
import java.util.*;
import com.google.gson.*;

public class FindSecret {
    public static void main(String[] args) throws Exception {
        String[] files = {"TestCase1.json", "TestCase2.json"};
        for (String file : files) {
            SecretCase sc = SecretCase.fromJsonFile(file);
            BigInteger secret = sc.solveForConstant();
            System.out.println("Secret for " + file + ": " + secret);
        }
    }

    static class SecretCase {
        int n, k;
        List<BigInteger> xs = new ArrayList<>();
        List<BigInteger> ys = new ArrayList<>();

        static SecretCase fromJsonFile(String filename) throws Exception {
            Gson gson = new Gson();
            JsonObject obj = gson.fromJson(new FileReader(filename), JsonObject.class);
            JsonObject keys = obj.getAsJsonObject("keys");
            int n = keys.get("n").getAsInt();
            int k = keys.get("k").getAsInt();
            List<BigInteger> xs = new ArrayList<>();
            List<BigInteger> ys = new ArrayList<>();
            for (Map.Entry<String, JsonElement> entry : obj.entrySet()) {
                if (entry.getKey().equals("keys")) continue;
                int x = Integer.parseInt(entry.getKey());
                JsonObject valObj = entry.getValue().getAsJsonObject();
                int base = Integer.parseInt(valObj.get("base").getAsString());
                String valueStr = valObj.get("value").getAsString();
                BigInteger y = new BigInteger(valueStr, base);
                xs.add(BigInteger.valueOf(x));
                ys.add(y);
            }
            SecretCase sc = new SecretCase();
            sc.n = n;
            sc.k = k;
            sc.xs = xs;
            sc.ys = ys;
            return sc;
        }

        // Lagrange interpolation at x=0 to get the constant term
        BigInteger solveForConstant() {
            int k = this.k;
            List<BigInteger> xs = this.xs;
            List<BigInteger> ys = this.ys;
            if (xs.size() < k) throw new RuntimeException("Not enough points");
            // Use the first k points
            BigInteger result = BigInteger.ZERO;
            for (int i = 0; i < k; i++) {
                BigInteger xi = xs.get(i);
                BigInteger yi = ys.get(i);
                BigInteger num = BigInteger.ONE;
                BigInteger den = BigInteger.ONE;
                for (int j = 0; j < k; j++) {
                    if (i == j) continue;
                    BigInteger xj = xs.get(j);
                    num = num.multiply(xj.negate());
                    den = den.multiply(xi.subtract(xj));
                }
                // Use rational arithmetic instead of modular arithmetic
                BigInteger li = num.divide(den);
                result = result.add(yi.multiply(li));
            }
            return result;
        }
    }
} 